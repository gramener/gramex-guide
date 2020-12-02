# Home Credit Default Risk

- Introduction
  - The contest is at https://www.kaggle.com/c/home-credit-default-risk/data?select=application_train.csv
  - We want to figure out whether a given loan application will fail
  - Here's a form that shows the result. Choose a random existing application (from training data) or enter your own details
- Create the first model
  - [x] Download the data (I'll split the original data into 90% - 10% -- use the first 90%)
  - [x] Create the configuration
  - [TBD] ... which should just be able to train from a CSV file
  - [ ] Check some results against the actual (some are right, some are wrong)
  - [ ] Check the model training quality
- Improve the model
  - Change the model
  - Add more data -- incrementally train using the remaining 10%
- Deploy
  - Create a form
