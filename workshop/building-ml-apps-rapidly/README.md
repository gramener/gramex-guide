---
title: Building Machine Learning Apps Rapidly
prefix: workshop
...

<!--

TODO

- [ ] Commit all images under this folder via Git LFS
- [ ] Replace Dropbox links with Guide links
- [ ] Ensure images have a {: .img-fluid} to fit width
- [ ] Convert unordered lists to ordered lists -- so we can refer to "Step 3"
- [ ] Anand: Once deployed, erase the Dropbox Paper and point to the guide
-->


* Guide link: [https://bit.ly/mlworkshopguide](https://bit.ly/mlworkshopguide)
* Opening survey link: [https://bit.ly/mlworkshopintro](https://bit.ly/mlworkshopintro)
* Dataset link: [https://www.dropbox.com/s/9p0510n3bpdn09w/admission.csv?dl=0](https://www.dropbox.com/s/9p0510n3bpdn09w/admission.csv?dl=0)
* IDE link: [https://gramex.gramener.com](https://gramex.gramener.com)
* Final survey link: [https://bit.ly/mlworkshopresponse](https://bit.ly/mlworkshopresponse)
* Output for certificate link: [http://bit.ly/GramexOP](http://bit.ly/GramexOP)

### A Quick Survey
Before we start, could you please fill in this 15-second survey? [https://bit.ly/mlworkshopintro](https://bit.ly/mlworkshopintro)


## Objective
This workshop aims to teach you how

- a practical example of how a modern ML App is built
- low-code approaches make this fast and flexible
- micro-services make it easier to extend applications

## Overview

In this workshop, we’ll predict whether or not a student will get admitted into a college in the US. Specifically, we’re going to

- [Objective](#objective)
- [Overview](#overview)
- [Explore the data](#explore-the-data)
- [Build a model to predict who'll get admitted](#build-a-model-to-predict-wholl-get-admitted)
  - [IDE Tutorial](#ide-tutorial)
- [Build an app that predicts admission](#build-an-app-that-predicts-admission)
- [Publish your project on GitHub](#publish-your-project-on-github)
- [Summarize Learnings](#summarize-learnings)
- [Learning more](#learning-more)
  - [Try next steps:](#try-next-steps)
  - [What if you need help?](#what-if-you-need-help)
  - [Share feedback](#share-feedback)


## Explore the data
The dataset [admission.csv](https://www.dropbox.com/s/9p0510n3bpdn09w/admission.csv?dl=0) looks like this:

![](https://paper-attachments.dropbox.com/s_426CF8CB2BD59D7303C39FB7F691A7D4921942F61C49F5B11CD4C1D3718CC93F_1617244813193_image.png)


Each row is a student. We have data for 500 students. For every student, we know their

- Name
- GRE Scores (out of 340)
- TOEFL Scores (out of 120)
- University Rating (out of 5)
- Statement of Purpose strength (out of 5)
- Letter of Recommendation strength (out o
- Undergraduate GPA (out of 10)
- Research Experience (0=no, 1=yes)
- Admitted (0=no, 1=yes). This is the outcome variable

## Build a model to predict who'll get admitted

We’ll use Gramex for this. You can either

- [install Gramex](/install), or
- [try out the online IDE](https://gramex.gramener.com/)

### IDE Tutorial

1. Visit [https://gramex.gramener.com/](https://gramex.gramener.com/)
2. Click on the “Create new project” button

  ![](https://paper-attachments.dropbox.com/s_426CF8CB2BD59D7303C39FB7F691A7D4921942F61C49F5B11CD4C1D3718CC93F_1617245361358_image.png)


3. Under “Create a Blank Project”, type “admission” as your project name and click “Create Project”

  ![](https://paper-attachments.dropbox.com/s_426CF8CB2BD59D7303C39FB7F691A7D4921942F61C49F5B11CD4C1D3718CC93F_1617245498248_image.png)

4. The “admission” project is created. Click on it to open the IDE.

  ![](https://paper-attachments.dropbox.com/s_426CF8CB2BD59D7303C39FB7F691A7D4921942F61C49F5B11CD4C1D3718CC93F_1617245529209_image.png)

5. Add an [MLHandler](/mlhandler) component

  ![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1617246133642_image.png)

6. Enter “predict” under the Pattern: as the MLHandler end point URL.
    Download the dataset `admission.csv` and upload it using the Upload icon.
    Click on Preview to see the dataset.

  ![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1620982867363_image.png)

  Next,

  * In Columns to Exclude, select “Name”
  * In Categorical Columns, select “Research”
  * In Numerical Columns, select everything except “Name”, “Research” and “Admitted”
  * In Pick a Target Column, select “Admitted”
  * In Pick a Model, select “Logistic Regression” (default)
  * Press Submit

  ![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1617246614108_proxy.gif)

7. After a few seconds, click on the “/predict” link. This opens the trained model page
![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1617246704109_image.png)

8. The URL will look something like this: https://9286.gramex.gramener.co/predict. From now on, we’ll refer to it as `/predict`. You need to type out the https://… part by yourself.
9. Let’s predict the admissions of a few people. Add these query parameters to your URL and see if the “Admitted” field is correct.
  - Ethan Koch:

  ```
  /predict?GREScore=337&TOEFLScore=118&UniversityRating=4&SOP=4.5&LOR=4.5&CGPA=9.65&Research=1
  ```

  - Diana Strong:

  ```
  /predict?GREScore=324&TOEFLScore=107&UniversityRating=4&SOP=4&LOR=4.5&CGPA=8.87&Research=1
  ```

Now let’s explore a student — Darius Michael. He has an excellent GRE score — 340. In fact, that’s the highest score. But Darius did not get admitted. What could he have done differently? Let’s explore.

`/predict?GREScore=340&TOEFLScore=114&UniversityRating=5&SOP=4&LOR=4&CGPA=9.6&Research=1`


- Increase his TOEFL score from 114 to 115. Does he get admitted?
- Increase his SOP from 4 to 4.5. Does he get admitted?
- Increase his LOR from 4 to 4.5. Does he get admitted?
- Increase his CGPA from 9.6 to 9.7. Does he get admitted?

Which of these worked? Which of these didn’t?

## Build an app that predicts admission

Let’s now build a web app that uses this data like an API.

- Click on the code editor on the left — the second icon. This shows a list of all files created for the app. Select `index.html`

  ![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1617250430996_proxy.gif)

- Delete all lines from `index.html`
- Copy paste the following file into `index.html`

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <title>admission</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="style.scss">
  <style>
    #result { font-weight: normal; }
  </style>
</head>
<body>
  {% set base = '.' %}
  {% include template-navbar.html %}
  <div class="container py-4">
    <div class="row">
      <div class="col-sm-6">
        <form class="admission">
          <div class="form-group row">
            <label for="GREScore" class="col-md-4">GRE Score</label>
            <input type="number" class="form-control col-md-8" name="GREScore" min="280" max="340">
          </div>
          <div class="form-group row">
            <label for="TOEFLScore" class="col-md-4">TOEFL Score</label>
            <input type="number" class="form-control col-md-8" name="TOEFLScore" min="90" max="120">
          </div>
          <div class="form-group row">
            <label for="UniversityRating" class="col-md-4">University Rating</label>
            <input type="number" class="form-control col-md-8" name="UniversityRating" min="1" max="5">
          </div>
          <div class="form-group row">
            <label for="SOP" class="col-md-4">SOP</label>
            <input type="number" class="form-control col-md-8" name="SOP" step="0.5" min="1" max="5">
          </div>
          <div class="form-group row">
            <label for="LOR" class="col-md-4">LOR</label>
            <input type="number" class="form-control col-md-8" name="LOR" step="0.5" min="1" max="5">
          </div>
          <div class="form-group row">
            <label for="CGPA" class="col-md-4">CGPA</label>
            <input type="number" class="form-control col-md-8" name="CGPA" step="0.01" min="6" max="10">
          </div>
          <div class="form-group row">
            <label for="Research" class="col-md-4">Research</label>
            <select class="form-control col-md-8" name="Research">
              <option value="0">0: No</option>
              <option value="1">1: Yes</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
      </div>
      <div class="col-sm-6 text-center text-middle">
        <h1 id="result"></h1>
      </div>
    </div>
  </div><!-- .container-fluid -->
  <script src="ui/jquery/dist/jquery.min.js"></script>
  <script src="ui/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
  <script src="ui/lodash/lodash.min.js"></script>
  <script src="ui/g1/dist/g1.min.js"></script>
  <script>
    $('.admission').on('submit', function (e) {
      e.preventDefault()
      $.getJSON('predict?' + $(this).serialize())
        .then(function (results) {
          console.log('Results', results)
          $('#result').html(
            results[0].Admitted ? 'You will <strong class="text-success">be admitted</strong>' : 'You will <strong class="text-danger">not be admitted</strong>'
          )
        })
        .fail(function (xhr) {
          console.error(xhr)
          $('#result').html('<strong class="text-danger">Error</strong>. Please enter values correctly')
        })
    })
    $('.admission :input').on('change', function () {
      $('#result').html('')
    })
  </script>
</body>
</html>
```

- Visit your app by going to the home page and clicking on “Launch app” against the “admissions” app

![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1617250662843_proxy.gif)

- Now, try out different combinations of marks and see the result.

## Publish your project on GitHub

Now, let’s save your app as repository on Github. You (or anyone) can run it with the Gramex IDE.


- If you don’t have a Github account, sign up at https://github.com/join
- If you have a Github account, log in at https://github.com/login
- Create a new repository at https://github.com/new. Call it “admission”. Click “Create repository”

![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1619345042620_image.png)

- Once the repository  is created, copy the HTTPS link on the next page. It will look like `https://github.com/<your-id>/admission.git`

![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1619345116120_image.png)

- Click on the code editor on the left — the second icon. Press `Ctrl+\`` (Ctrl-Backtick) to open the Terminal. Then type these commands:

```bash
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
git init
git add .     # Don't forget the . at the end
git commit -m "basic prediction"
# Replace <your-id> with your user ID here
git remote add origin https://github.com/<your-id>/admission.git
git push -u origin master
```

![](https://paper.dropbox.com/ep/redirect/image?url=https%3A%2F%2Fpaper-attachments.dropbox.com%2Fs_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1619346371852_proxy.gif&hmac=w6isVTPOsGiCsWSZJyA5wqZ7cdBrgcyHl8z4C5u0gJ8%3D)


- While typing `git push -u origin master`, Github will prompt you to authorize the code serve. Select “Authorize cdr” when this appears.

![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1619346419846_image.png)


Now, this project is is available on your Github repository. To clone it, anyone can:


1. Visit https://gramex.gramener.com/
2. Click on the “Create new project” button

![](https://paper-attachments.dropbox.com/s_426CF8CB2BD59D7303C39FB7F691A7D4921942F61C49F5B11CD4C1D3718CC93F_1617245361358_image.png)

3. Type your repository link under “Clone a Repository”. It will be like `https://github.com/<your-id>/admission.git`.
4. Type any new project name.
5. Then click “Clone”

![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1619346692625_image.png)


## Summarize Learnings


- Low-code platforms make it easy to create applications quickly
- They can be extended in any way using custom code
- This makes them a powerful combination of speed and flexibility

## Learning more

### Try next steps:

- Explore the models to see which model has the best accuracy
- Extend the application to show the list of users. Click on a user to fill the form with their score.
- Extend the application to build a live simulator like [https://gramener.com/processmonitor/predictor](https://gramener.com/processmonitor/predictor)
- Learn more about configuring the micro-service at [https://learn.gramener.com/guide/mlhandler/](https://learn.gramener.com/guide/mlhandler/)

### What if you need help?

First, let’s set up your StackOverflow accounts.


- If you don’t have a StackOverflow account, sign up: [https://stackoverflow.com/users/signup](https://stackoverflow.com/users/signup)
- If you have a StackOverflow account, log in: [https://stackoverflow.com/users/login](https://stackoverflow.com/users/login)
- Search for questions tagged Gramex: [https://stackoverflow.com/questions/tagged/gramex](https://stackoverflow.com/questions/tagged/gramex)
- Click on any question. Test your account by upvoting it. (You can undo it later if you wish.)
- Now you can ask any question about Gramex via https://stackoverflow.com/questions/ask?tags=gramex

With your Github account, you can report a Gramex bug at [https://github.com/gramener/gramex/issues/new](https://github.com/gramener/gramex/issues/new)

You can browse the Gramex Guide and learn more at [https://gramener.com/gramex/guide/](https://gramener.com/gramex/guide/)

Finally, you can e-mail cto@gramener.com (e.g. on this project, pushing to git, etc.) for help

### Share feedback

We’d love to get your feedback, and help you with your learning & career.
Could you please fill this 1-minute survey:
[https://bit.ly/mlworkshopresponse](https://bit.ly/mlworkshopresponse)

If you like Gramex, visit [https://github.com/gramener/gramex/](https://github.com/gramener/gramex/)
and click on `☆ Star` to stay updated with Gramex.

![](https://paper-attachments.dropbox.com/s_892A7A54CD6216A08E7D697EBC99FE6874AEA48848176A48827BC0502AD1032C_1619346569342_image.png)
