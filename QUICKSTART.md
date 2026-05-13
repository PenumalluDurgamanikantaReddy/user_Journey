# 🚀 Quick Start Guide

## Dashboard Overview

Welcome to the **User Journey Analytics Dashboard**! This guide will help you navigate and use all the features.

## 📍 Main Sections

### 1. **Header Statistics** (Top)
Three cards showing your data snapshot:
- **Total Users in Dataset**: Total number of users (15)
- **Filtered Results**: Number of users after applying filters
- **Filter Coverage**: Percentage of data displayed (%)

---

## 🔍 Using Filters

### How to Filter:

1. **Brand Filter** (Top-Left)
   - Select specific brands: Biblword, SheRises, AlKitab, Search4Truth
   - Select multiple brands to combine filters
   - Example: Select "Biblword" to see only Biblword users

2. **Language Filter** (Top-Middle)
   - Filter by user languages
   - Scroll down to see all 9+ languages
   - Example: Select "English" and "Spanish" to see bilingual reach

3. **Phase Filter** (Top-Right)
   - Select phases: Evangelism, Discipleship, Leadership
   - Example: Select "Evangelism" to focus on new users

4. **Status Filter** (Bottom-Left)
   - Choose: Active, Inactive, or both
   - Example: Select "Active" to see only engaged users

5. **Date Range** (Bottom-Middle)
   - Pick start and end dates
   - Example: Set date range to last 30 days
   - Format: DD-MM-YYYY

6. **Reset Button** (Top-Right)
   - Clear all filters at once
   - Returns to showing all 15 users

### Filter Behavior:
- Filters are **cumulative** (AND logic)
- Select "Biblword" + "English" = Biblword users who speak English
- Leave empty = Show all users for that filter
- Changes apply instantly

---

## 📊 Bubble Visualization

The three-column funnel shows user journey progression:

### Column 1: **Content** (Purple heading)
How users first engaged:
- **Ads** (Yellow bubble)
- **Facebook** (Blue bubble)
- **Instagram** (Pink bubble)
- **YouVersion App** (Purple bubble)
- **Website** (Green bubble)
- **AI Chat** (Cyan bubble)
- **Courses** (Red bubble)

### Column 2: **Conversation** (Purple heading)
Active engagement:
- **Comments** (Users commenting publicly)
- **DMs** (Direct message conversations)
- **Courses** (Course enrollments)

### Column 3: **Goal** (Purple heading)
Final outcomes:
- **Conversation** (Active ongoing engagement)
- **Church** (Connected to church/spiritual community)

### Reading the Bubbles:
- **Bubble Size** = Relative to percentage
- **Number** = Count of users
- **Percentage** = % of filtered users
- **Color** = Medium/channel type
- **Hover** = Shows tooltip with exact numbers

### Flow Arrows:
Show progression from Content → Conversation → Goal

---

## 📈 Analytics Cards

Below the bubbles, find detailed analytics:

### **Medium Breakdown**
- Each medium listed with:
  - Total users (colored badge)
  - Active count (green text)
  - Goal-reached count (purple text)
  - Progress bar showing distribution
- Example: "Ads: 2 users, Active: 2, Goal: 1"

### **Phase Distribution**
- Users in each phase:
  - Evangelism (47%)
  - Discipleship (33%)
  - Leadership (20%)

### **Top Languages**
- Ranked list of languages by user count
- Shows: #1 English (5), #2 Spanish (2), etc.

### **Key Metrics**
Three gradient cards showing:
- **Conversion Rate to Church**: % who reached church goal
- **Active Engagement**: % of active users
- **Avg Engagement Level**: Average engagement 0-100%

---

## 👥 User Details Table

Scroll to the bottom to see all filtered users:

### Columns:
1. **Name** - User full name
2. **Medium** - How they entered (Facebook, Ads, etc.)
3. **Language** - Their language preference
4. **Phase** - Current phase (evangelism/discipleship/leadership)
5. **Status** - Active or Inactive
6. **Engagement** - Visual bar 0-100%
7. **Goal** - Their conversion goal (Conversation/Church)

### Sort Options:
Use buttons to change table sort:
- **Sort by Date** - Newest users first (default)
- **Sort by Engagement** - Highest engagement first
- **Sort by Name** - Alphabetical order

### Color Coding:
- **Phase badges**: Blue (Evangelism), Purple (Discipleship), Indigo (Leadership)
- **Status badges**: Green (Active), Gray (Inactive)
- **Goal badges**: Orange (Conversation), Green (Church)

---

## 📋 Common Tasks

### Task 1: Find Most Engaged Evangelism Users
1. Filter: Phase = "Evangelism"
2. Sort by: "Engagement"
3. Look at top users in table

### Task 2: Check Spanish-Speaking Results
1. Filter: Language = "Spanish"
2. View bubble visualization
3. Check Medium Breakdown for Spanish users

### Task 3: See Biblword Brand Performance
1. Filter: Brand = "Biblword"
2. Check Key Metrics for conversion rate
3. Compare with other brands

### Task 4: Find Active Users in Leadership Phase
1. Filter: Phase = "Leadership"
2. Filter: Status = "Active"
3. View table to see specific users

### Task 5: Last 30 Days Activity
1. Set Date Range: Last 30 days
2. Filter: Status = "Active"
3. Check Filtered Results count

---

## 💡 Tips & Tricks

### 1. **Multiple Filter Combinations**
- Select multiple options within a filter (e.g., Biblword + SheRises)
- Combine across filters (Brand + Language + Phase)
- Creates powerful segmentation

### 2. **Understanding Percentages**
- Each bubble shows: "(X users, XX%)"
- Percentage is: (Bubble users / Total filtered users) × 100
- Example: "3 Comments, 33%" means 3 out of 9 filtered users

### 3. **Filter Coverage**
- Shows what % of total 15 users are displayed
- Start at 100% (all 15 shown)
- Decreases as you add more filters

### 4. **Active vs Total Users**
- Active status shows in Stats
- Medium Breakdown shows: "Active: X"
- Example: "Ads: 2 users, Active: 2" means both are active

### 5. **Language Insights**
- See which languages have highest engagement
- Plan content in top languages
- Identify underserved language groups

---

## 🎯 Data Insights Examples

### High Conversion Channels:
- Check Medium Breakdown for Goal: X numbers
- AI Chat, Courses typically show higher conversion

### Language Focus:
- Top Languages section identifies primary languages
- English (5), Spanish (2), Portuguese (2)
- Prioritize content for top languages

### Phase Flow:
- Evangelism: 47% (Awareness & Interest)
- Discipleship: 33% (Growth & Learning)
- Leadership: 20% (Development & Mentoring)

### Engagement Patterns:
- Check Avg Engagement Level by filter
- Identify which channels have highest engagement
- Compare phases for completion rates

---

## 🔄 Refresh & Updates

### Current Data:
- Dashboard shows 15 sample users
- Demo data with realistic scenarios
- All filters functional with demo data

### To Connect Real Data:
Backend integration will be configured separately
- Live Excel sheet data
- Real-time updates
- Historical tracking

---

## ❓ FAQ

**Q: What does "Filtered Results" mean?**
A: It's the number of users shown after applying your active filters.

**Q: Can I select multiple items in one filter?**
A: Yes! Check multiple boxes in Brand, Language, Phase filters.

**Q: How are percentages calculated?**
A: % = (Users in bubble / Total filtered users) × 100

**Q: What if I want to see all data again?**
A: Click the red "Reset All" button in the Filters section.

**Q: Can I sort the table?**
A: Yes, use the three sort buttons: Date, Engagement, Name

**Q: What's the difference between "Conversation" and "Church" goals?**
A: Conversation = Active ongoing engagement; Church = Connected to religious community

**Q: How often does data update?**
A: Currently demo data. Real data will update based on backend schedule.

---

## 📞 Support

For more detailed information, see:
- **DASHBOARD_GUIDE.md** - Complete technical documentation
- **IMPLEMENTATION_SUMMARY.md** - Feature overview and structure

---

**Start exploring your user journey data now!** 🎯

---

**Version**: 1.0.0
**Last Updated**: May 2026
**Status**: Ready to Use
