# Project1 README

<h2>Overview: </h2>

<h3>Information About Visualizations</h3>

In order to help Zayo better identify which market (Denver, Atlanta, or Dallas) they should expand their services to, we created five visualizations:
1. Introduction to random forest classifier. Bar chart displaying feature importances changes color and has a tooltip displaying the label.
2. Hierarchical bubble chart for viewing percentage of open opportunities in each state and city. Clicking on a state bubble will zoom in on collection of cities. Tooltip displays city, number of opportunities, and percent of open opportunities. 
3. Map of all opportunities in each city, color-coded by our prediction that an opportunity will close. Clicking on a state will zoom in on that state. Tooltip displays our prediction this opportunity will close.
4. Bar chart for displaying aggregate amount of monthly recurring revenue (`Total BRR`) for each state, broken down by opportunity stage. Dropdown menu for filtering results by stage of opportunity.
5. Distribution of contract lengths (`Term in Months`).

<h3>Design Process</h3>

Before settling on these visualizations, we build a random forest classifier to identify key features distinguishing won from lost opportunities. These important features (`Term in Months`, `Total BRR`) are highlighted in the above visualizations. The classifier is also used to generate predictions for `1 - Working` and `2 - Best Case` opportunities. These probabilities are used to color the opportunities on our map.

The visualizations chosen addressed the requirements of the project in terms of diversity of visualization types:
1. Spatial and non-spatial: our second and third visualizations are spatial, and other visualizations are non-spatial
2. Merged attributes across multiple CSVs: 
  * `Building ID` was merged across `ZayoHackathonData_Opportunities.csv` and `ZayoHackathonData_Buildings.csv` to associate `Latitude` and `Longitude` with an `Opportunity ID`, 
  * `Opportunity ID` was merged across `ZayoHackathonData_Opportunities.csv`, `ZayoHackathonData_Buildings.csv`, `ZayoHackathonData_CPQs.csv`, and `ZayoHackathonData_Accounts.csv` for our random forest classifier
3. Over five different attributes: `City`, `State`, `Latitude`, `Longitude`, `Term In Months`, `StageName`, `Total BRR` + some derived features (percentage of open opportunities by city, prediction probability)

More specifically, we chose each of the visualization types we did:
1. To explain important features in distinguishing won from lost opportunities. A tree was a natural choice, since the algorithm generates several decision trees. A bar chart was chosen to display feature importances. The y-scale on the bar chart was ommitted since we only care about the ranking of features.
2. To give a more general overview of open opportunities. A bubble chart was chosen because of the natural hierarchy between cities and states.
3. To show how opportunities are distributed across the United States. Since the data is spatial, a map seemed to make the most sense.
4. To describe how much won, lost, or potential money is in each state. A bar chart seemed to be the most obvious way of representing this data.
5. To show a detailed view of contract length by opportunities won and lost. A bar chart is a natural way to represent distributions.

<h4>Above & Beyond</h4>

We attempted a few improvements beyond the minimum requirements: `Dashboarding`, `Added Visualizations`, `Dynamic Queries` (drop-down to filter by `StageName` in our fourth visualization), `Missing Data` (handled in our pre-processing Python script), and `Style` (consistent colors and fonts across all visualization, drawn from Zayo's website).

<h3>Team Roles</h3>

* **Zanqing Feng**: Creating our fourth visualization
* **Sam Molnar**: Creating our second visualization, Making the python scripts for pre-processing our data, Protyping
* **Allie Morgan**: Created our first visualization, Protyping, Making README
* **Conner Simmering**: Created our third visualization, Picking a dashboard for all of our visualizations to fit into, Protyping
* **Matt Whitlock**: Created our fifth visualization, Protyping

<h3>How to Run our Visualization</h3>

To perform the data preprocessing, run the script `clean_predictions.py` in the `lib` folder.  "Navigate to `src` and run `python -m SimpleHTTPServer` to view our project.

