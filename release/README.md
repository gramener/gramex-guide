---
title: Gramex release notes
prefix: Release
...


## Release Process

Gramex is released with new features on the first of every month.

**Major versions** are released every **4-6 years**

- Examples:
  - **Gramex 0.0** released in Nov 2011. It focused on custom data visualizations through templates.
  - **Gramex 1.0** released in Sep 2015. It moved from code-based to configuration-based development.
  - **Gramex 2.0** will release in 2022. It will move from configuration-based to UI-based development.
- Major versions contain
  - Significant architectural changes
  - New features / UX etc.
  - Changes for performance & productivity
- Major versions may **NOT** be backward compatible.

**Minor versions** are released on the **1st of every month**

- Examples:
  - [**Gramex 1.65**](1.65/) released on 1 Nov 2020. It had Excel table support, functions as REST APIs, logging via ElasticSearch.
  - [**Gramex 1.66**](1.66/) released on 1 Dec 2020. It automatically created tables when users insert a row of data.
  - [**Gramex 1.67**](1.67/) released on 1 Jan 2021. It trains and deploys ML models based without requiring code.
- Minor versions contain
  - New features
  - Enhancements to existing features
  - Bug fixes and consolidated patches
- Minor versions are **backward compatible** unless explicitly deprecated.

**Patch versions** are released as and **when required**

- Examples:
  - **Gramex 1.63.0** released on 1 Sep 2020. It was the minor version release.
  - **Gramex 1.63.1** released on 15 Sep 2020. It fixed an authentication configuration bug.
  - **Gramex 1.63.2** released on 22 Sep 2020. It fixed a URL redirection bug
- Patch versions contain
  - Critical Bug Fixes
  - Reported Security issues
  - Minor feature enhancements
- Patch versions are backward compatible and roll up into the next minor version.

This [presentation](gramex-release-process.pptx) documents the release process.

## Release Notes

- [v1.72.0: OpenAPI support, a root cause algorithm, charts in UIFactory](1.72/) <small>1 Sep 2021</small>
- [v1.71.0: ComicHandler, security updates](1.71/) <small>1 Aug 2021</small>
- [v1.70.0: MLHandler templates, MongoDB, Bootstrap 5, Vue.](1.70/) <small>6 Jul 2021</small>
- v1.69.3: Patch release <small>18 Jun 2021</small>: MongoDB in FormHandler, Auto-compile Vue files, MLHandler default template
- v1.69.2: Patch release <small>12 May 2021</small>
- v1.69.1: Patch release <small>16 Apr 2021</small>
- On 1 Apr 2021, [UIFactory](https://www.npmjs.com/package/uifactory) was released on npm
- [v1.69.0: Server template extensions, PPTX Donut charts.](1.69/) <small>2 Mar 2021</small>
- [v1.68.0: UI Factory creates embeddable forms.](1.68/) <small>1 Feb 2021</small>
- [v1.67.0: Train and deploy ML models. Simpler names for micro-services.](1.67/) <small>1 Jan 2021</small>
- [v1.66.0: Auto-create table schema, fetch inserted rows, and UI themes](1.66/) <small>1 Dec 2020</small>
- [v1.65.0: Excel table support, functions as REST APIs, logging via ElasticSearch](1.65/) <small>1 Nov 2020</small>
- [v1.64.0: Multiple apps per server, multiple logins per app, and secure and offline deployment](1.64/) <small>1 Oct 2020</small>
- [v1.63.2: Internal release](1.63.2/) <small>22 Sep 2020</small>
- [v1.63.0: Docker and conda install, Guide UI & proxy websockets](1.63/) <small>1 Sep 2020</small>
- [v1.62.0: Gramex Charts, PPTXHandler tables & charts](1.62/) <small>1 Aug 2020</small>
- [v1.61.1: PPTXHandler bug fixes](1.61.1/) <small>13 Jul 2020</small>
- [v1.61.0: PPTXHandler v2 and Redis Cache](1.61/) <small>1 Jul 2020</small>
- Gramex now releases feature updates on the 1st of every month, and patch updates as required.
- [v1.60.0: File Manager](1.60/) <small>27 May 2020</small>
- [v1.59.0: DriveHandler](1.59/) <small>11 May 2020</small>
- There was a pause in Gramex development as we restructured the product team's focus.
- [v1.58.0: UI component upgrades, FileHandler bugfix, dependencies](1.58/) <small>22 Nov 2019</small>
- [v1.57.0: UI component upgrades, pptxhandler, Cache and Guide](1.57/) <small>18 Aug 2019</small>
- [v1.56.0: Vega parameter substitution, Tutorials, Chrome device emulation and UI component upgrades](1.56/) <small>07 Jun 2019</small>
- [v1.55.0: FormHandler and UI component upgrades](1.55/) <small>15 May 2019</small>
- No release in April. We changed direction to focus on documentation and usability.
- [v1.54.0: Admin UI for alerts, LanguageTool, New data formats](1.54/) <small>31 Mar 2019</small>
- [v1.53.0: NLG (beta), Gramextest, Fuzzy search, Template UI modules](1.53/) <small>18 Mar 2019</small>
- [v1.52.0: Auto-complete snippets, SEO-friendly URLs and Personalized alerts](1.52/) <small>1 Mar 2019</small>
- [v1.51.0: Improves charts, PDF support, security and testing](1.51/) <small>16 Feb 2019</small>
- [v1.50.0: Automated testing, UI theme designer, Translation UI](1.50/) <small>2 Feb 2019</small>
- [v1.49.0: Chart gallery, New boilerplate, Animated templates, UI search](1.49/) <small>15 Jan 2019</small>
- [v1.48.0: Template components, Automated translations](1.48/) <small>31 Dec 2018</small>
- [v1.47.0](1.47/) <small>17 Dec 2018</small>
- [v1.46.0](1.46/) <small>03 Dec 2018</small>
- [v1.45.0](1.45/) <small>15 Nov 2018</small>
- [v1.44.0](1.44/) <small>31 Oct 2018</small>
- [v1.43.0](1.43/) <small>02 Oct 2018</small>
- [v1.42.0](1.42/) <small>17 Sep 2018</small>
- [v1.41.0](1.41/) <small>01 Sep 2018</small>
- [v1.40.0](1.40/) <small>15 Aug 2018</small>
- [v1.39.0](1.39/) <small>17 Jul 2018</small>
- [v1.38.0](1.38/) <small>01 Jul 2018</small>
- [v1.37.0](1.37/) <small>15 Jun 2018</small>
- [v1.36.0](1.36/) <small>31 May 2018</small>
- [v1.35.0](1.35/) <small>21 May 2018</small>
- [v1.34.0](1.34/) <small>02 May 2018</small>
- [v1.33.0](1.33/) <small>15 Apr 2018</small>
- [v1.32.0](1.32/) <small>01 Apr 2018</small>
- [v1.31.0](1.31/) <small>15 Mar 2018</small>
- [v1.30.0](1.30/) <small>28 Feb 2018</small>
- [v1.29.0](old#v1290-2018-02-15) <small>15 Feb 2018</small>
- [v1.28.0](old#v1280-2018-01-31) <small>31 Jan 2018</small>
- [v1.27.0](old#v1270-2018-01-20) <small>20 Jan 2018</small>
- [v1.26.0](old#v1260-2017-12-31) <small>31 Dec 2017</small>
- [v1.25.0](old#v1250-2017-12-15) <small>15 Dec 2017</small>
- [v1.24.0](old#v1240-2017-11-30) <small>30 Nov 2017</small>
- [v1.23.1](old#v1231-2017-11-13) <small>13 Nov 2017</small>
- [v1.23.0](old#v1230-2017-10-31) <small>31 Oct 2017</small>
- [v1.22.0](old#v1220-2017-09-28) <small>28 Sep 2017</small>
- [v1.21.0](old#v1210-2017-08-29) <small>29 Aug 2017</small>
- [v1.20.0](old#v1200-2017-07-31) <small>31 Jul 2017</small>
- [v1.19.0](old#v1190-2017-07-09) <small>09 Jul 2017</small>
- [v1.18.0](old#v1180-2017-06-29) <small>29 Jun 2017</small>
- [v1.17.1](old#v1171-2017-04-23) <small>23 Apr 2017</small>
- [v1.17](old#v117-2017-01-29) <small>29 Jan 2017</small>
- [v1.16](old#v116-2016-10-16) <small>16 Oct 2016</small>
- [v1.15](old#v115-2016-08-21) <small>21 Aug 2016</small>
- [v1.14](old#v114-2016-08-11) <small>11 Aug 2016</small>
- [v1.13](old#v113-2016-08-01) <small>01 Aug 2016</small>
- [v1.12](old#v112-2016-07-21) <small>21 Jul 2016</small>
- [v1.11](old#v111-2016-07-15) <small>15 Jul 2016</small>
- [v1.10](old#v110-2016-07-01) <small>01 Jul 2016</small>
- [v1.0.9](old#v109-2016-06-15) <small>15 Jun 2016</small>
- [v1.0.8](old#v108-2016-06-01) <small>01 Jun 2016</small>
- [v1.0.7](old#v107-2016-05-15) <small>15 May 2016</small>
- [v1.0.6](old#v106-2016-05-01) <small>01 May 2016</small>
- [v1.0.5](old#v105-2016-04-15) <small>15 Apr 2016</small>
- [v1.0.4](old#v104-2016-03-30) <small>30 Mar 2016</small>
- [v1.0.3](old#v103-2016-01-18) <small>18 Jan 2016</small>
- [v1.0.2](old#v102-2015-10-11) <small>11 Oct 2015</small>
- [v1.0.1](old#v101-2015-09-09) <small>09 Sep 2015</small>
- [v1.0.0](old#v100-2015-09-08) <small>08 Sep 2015</small>
