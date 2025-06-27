# TripWise: Travel Schedule & Expense Manager

A comprehensive React.js application for planning trips, tracking expenses, and collaborating with travel companions. Built with modern web technologies for a seamless mobile-first experience.

## 🌟 Features

### 1. Trip Dashboard
- Overview of upcoming trips with quick stats
- Budget vs. spending tracking
- Visual progress indicators
- Trip status management

### 2. Trip Scheduler (Calendar View)
- Create day-by-day itineraries
- Add events: flights, hotels, meals, tours, activities
- Time and location management
- Event categorization with color coding

### 3. Expense Tracker
- Track expenses by category (transport, food, accommodation, activities, shopping, tips)
- Multi-currency support
- Budget vs. actual spending analysis
- Interactive charts (pie chart by category, line chart for daily spending)
- Export functionality

### 4. Collaborative Mode
- Invite friends and family to plan trips together
- Assign tasks and responsibilities
- Split expenses and track balances
- Real-time collaboration features

### 5. Packing List & Notes
- Create categorized packing checklists
- Progress tracking
- Travel notes and reminders
- Import/export functionality

### 6. Progressive Web App (PWA)
- Offline functionality for travelers without internet
- Install on mobile devices
- Native app-like experience

## 🛠️ Tech Stack

- **Frontend**: React.js with Vite for fast development
- **Styling**: Tailwind CSS for responsive, mobile-first design
- **Icons**: Lucide React for beautiful, consistent icons
- **Charts**: Recharts for interactive data visualization
- **Routing**: React Router DOM for navigation
- **Date Handling**: date-fns for date manipulation
- **State Management**: React Context API

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/tripwise.git
cd tripwise
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## 📱 Mobile-First Design

TripWise is designed with a mobile-first approach, ensuring optimal user experience across all devices:

- Responsive navigation with collapsible sidebar
- Touch-friendly interfaces
- Optimized for various screen sizes
- Fast loading and smooth animations

## 🎨 Design System

- **Primary Colors**: Blue color scheme (#0ea5e9)
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Components**: Reusable, accessible components
- **Icons**: Lucide React icon set

## 📂 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Layout.jsx      # Main layout with navigation
├── pages/              # Page components
│   ├── Dashboard.jsx   # Trip overview dashboard
│   ├── TripScheduler.jsx  # Calendar and itinerary
│   ├── ExpenseTracker.jsx # Expense management
│   ├── PackingList.jsx    # Packing checklists
│   └── Collaborative.jsx # Team collaboration
├── context/            # React Context for state management
│   └── TripContext.jsx # Main application state
├── App.jsx            # Main app component
├── main.jsx          # Application entry point
└── index.css         # Global styles with Tailwind
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Future Enhancements

- Integration with Google Calendar API
- Real-time currency conversion API
- Google Maps integration for location tagging
- Social login (Google, Facebook)
- Push notifications for trip reminders
- Travel document storage
- Weather integration
- Flight tracking integration

## 💡 Feedback & Support

If you have any questions, suggestions, or issues, please feel free to open an issue or contact the development team.

---

**Happy Travels! ✈️🌎**
