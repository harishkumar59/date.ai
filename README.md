# Today in History

A sleek web application that lets you discover fascinating historical events that occurred on any date throughout history. Powered by Google's Gemini AI model.

![Today in History App](https://i.imgur.com/Qm5vwAX.png)

## Features

- 📅 **Date-based Historical Events**: Select any date to see significant events that happened on that day throughout history
- 🔍 **Today in History**: Quickly see what happened on today's date with a single click
- 💾 **Persistent Chat History**: Your conversations are saved locally and persist even after refreshing the page
- 🗂️ **Chat Management**: Create new chats, switch between saved conversations, and delete old ones
- 📱 **Responsive Design**: Works seamlessly on both desktop and mobile devices
- 🌙 **Modern UI**: Clean, intuitive interface with a minimalist design

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **AI**: Google's Gemini AI (via Google's Generative Language API)
- **State Management**: React Hooks, localStorage for persistence
- **Styling**: Custom Tailwind CSS components

## Getting Started

### Prerequisites

- Node.js 16.8.0 or later
- A Google AI API key (Gemini model)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/today-in-history.git
   cd today-in-history
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Select a date using the date picker or click the "Today in History" button
2. View the AI-generated historical events for that date
3. Create new conversations by clicking the "New Chat" button
4. Access your previous conversations from the sidebar
5. Delete conversations you no longer need

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google's Gemini AI for powering the historical information
- Next.js team for the amazing React framework
- Tailwind CSS for the styling utilities
