'''
Update Gramex Roadmap from JIRA board:
https://gramenertech.atlassian.net/jira/software/c/projects/GRAMEX/boards/116/roadmap

Set up:
'''

import json
import os
import requests
import time
from gramex.config import variables
from gramex.transforms import handler
from datetime import datetime
from requests.auth import HTTPBasicAuth

folder = os.path.dirname(os.path.abspath(__file__))
issues_file = os.path.join(folder, 'issues.json')


def get_issues(refresh: bool = False):
    now = time.time()
    delay = 24 * 60 * 60      # Refresh once a day
    if not refresh and os.path.exists(issues_file) and now - os.stat(issues_file).st_mtime < delay:
        return json.load(open(issues_file, encoding='utf-8'))

    # Get the API key. TODO: Move this into .secrets.yaml. Document an error here
    api_key = variables['JIRA_AUTH'].split(':', 1)

    # List all issues for board, paginated
    issues = []
    boards = [115, 116]
    for board in boards:
        url = f'https://gramenertech.atlassian.net/rest/agile/1.0/board/{board}/issue'
        params = {'startAt': 0}
        while True:
            result = requests.get(url, params=params,
                                  auth=HTTPBasicAuth(*api_key)).json()
            count = len(result['issues'])
            if count == 0:
                break
            issues += result['issues']
            params['startAt'] += count

        with open(issues_file, 'w', encoding='utf-8') as handle:
            json.dump(issues, handle, ensure_ascii=True)

    return issues


@handler
def get_roadmap(refresh: bool = False):
    issues = get_issues(refresh)

    # Select all future epics
    today = datetime.today().strftime('%Y-%m-%d')
    epicname, roadmap = {}, {}
    for issue in issues:
        if issue['fields']['issuetype']['hierarchyLevel'] == 1:
            if (issue['fields']['duedate'] or '') > today:
                epicname[issue['id']] = issue['fields']['summary']
                roadmap[issue['fields']['summary']] = {
                    'summary': issue['fields']['summary'],
                    'description': issue['fields']['description'],
                    'duedate': issue['fields']['duedate'],
                    "done": bool(issue['fields']['resolution']),
                    'features': {
                        'Component': [],
                        'Microservice': [],
                        'App': [],
                        'Other': []
                    }
                }

    # Add stories below them
    for issue in issues:
        # Only pick stories
        if not issue['fields']['issuetype']['hierarchyLevel'] == 0:
            continue
        # ... that have epics
        if not issue['fields']['epic']:
            continue
        # ... that are in the roadmap
        epic_id = str(issue['fields']['epic']['id'])    # noqa
        epic = roadmap.get(epicname.get(epic_id, None), None)
        if epic is None:
            continue
        # Add the features
        summary, type = issue['fields']['summary'], 'Other'
        for type in epic['features']:
            if issue['fields']['summary'].lower().startswith(type.lower()):
                summary = summary.split(':', 1)[-1].strip()
                break
        epic['features'][type].append({
            'key': issue['key'],
            'summary': summary,
            'description': issue['fields']['description'],
            "done": bool(issue['fields']['resolution']),
        })

    result = {}
    for id, epic in roadmap.items():
        entry = result.setdefault(epic['summary'], {})
        entry['duedate'] = epic['duedate']
    return roadmap
