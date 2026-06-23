SELECT Source, Medium, SUM(Users) as Total_Users FROM `dashboard-data-421414.globalrize_india.analytics_learnnn_events_combined` GROUP BY Source, Medium ORDER BY Total_Users DESC LIMIT 10;
