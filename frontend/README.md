# Focus Mode App - Intervention Engine Frontend

A React Native/Expo application that provides a focus mode interface with intelligent intervention capabilities. The app tracks student focus time and quiz performance, integrating with a backend intervention engine for real-time status updates and remedial task assignment.

## 🚀 Features

- **Focus Timer**: Track focus time with start/stop functionality
- **Daily Quiz**: Submit daily quiz scores (0-10)
- **Real-time Updates**: WebSocket integration for instant status changes
- **Three States**:
  - **On Track**: Normal focus mode with timer and quiz
  - **Under Review**: Locked state while mentor reviews performance
  - **Task Assigned**: Remedial task view with completion tracking
- **Responsive UI**: Works on web, iOS, and Android
- **TypeScript**: Full type safety throughout the codebase

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)

## 🛠️ Installation

1. **Clone the repository** (if applicable):
   ```bash
   cd f:\Intervention_Engine\frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configuration**:
   - Backend URLs and student ID are configured in `src/config.ts`
   - Current settings:
     - Backend: `https://intervention-engine.onrender.com`
     - Student ID: `11111111-1111-1111-1111-111111111111`

## 🏃 Running the App

### Web (Development)
```bash
npm run web
# or
npx expo start --web
```
Opens at `http://localhost:19006`

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

## 📦 Building for Production

### Build for Web
```bash
npm run build:web
```

This generates a static build in the `dist/` directory (or `.expo/web/build` depending on Expo version).

### Deploy to Vercel/Netlify

1. **Build the project**:
   ```bash
   npm run build:web
   ```

2. **Deploy**:
   - **Vercel**: Push to GitHub and connect repository
     - Build command: `npm run build:web`
     - Output directory: `dist` (check after build)
   
   - **Netlify**: Drag and drop the `dist` folder or connect GitHub
     - Build command: `npm run build:web`
     - Publish directory: `dist`

## 🎯 How It Works

### State Flow

1. **Normal State (ON_TRACK)**:
   - User starts focus timer
   - User enters quiz score
   - Submits daily check-in
   - If score > 7 AND focus_minutes > 60: remains ON_TRACK
   - Otherwise: switches to NEEDS_INTERVENTION

2. **Locked State (NEEDS_INTERVENTION)**:
   - App is locked, showing "Waiting for Mentor"
   - Backend triggers n8n webhook
   - Mentor receives email and reviews performance
   - Mentor assigns remedial task (or system auto-unlocks after timeout)

3. **Remedial State (ASSIGNED_TASK)**:
   - Displays assigned task (e.g., "Read Chapter 4")
   - User completes task offline
   - User clicks "Mark Complete"
   - System switches back to ON_TRACK

### WebSocket Events

The app listens for two events:
- `STATUS_CHANGED`: Updates status and clears task
- `INTERVENTION_ASSIGNED`: Sets new status and assigns task

### API Endpoints

- `GET /student/{id}/status`: Fetch current status
- `POST /daily-checkin`: Submit quiz score and focus time
- `POST /mark-complete`: Mark remedial task complete

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.ts              # HTTP client & API functions
│   ├── hooks/
│   │   └── useStudentState.ts     # WebSocket + state management
│   ├── components/
│   │   ├── FocusTimer.tsx         # Timer component
│   │   ├── QuizInput.tsx          # Quiz score input
│   │   ├── LockedView.tsx         # Locked state view
│   │   ├── RemedialView.tsx       # Remedial task view
│   │   └── StatusBanner.tsx       # Status indicator
│   ├── screens/
│   │   └── FocusScreen.tsx        # Main screen
│   └── config.ts                  # Configuration
├── App.tsx                        # Root component
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── app.json                       # Expo config
```

## 🔧 Configuration

Edit `src/config.ts` to change:
- Backend URL
- Student ID
- WebSocket URL

```typescript
export const BACKEND_HTTP_URL = "https://your-backend.onrender.com";
export const BACKEND_WS_URL = "wss://your-backend.onrender.com";
export const STUDENT_ID = "your-student-uuid";
```

## 🧪 Testing the Flow

1. **Start the app**: `npm run web`
2. **Test normal state**:
   - Start timer, wait 61+ seconds
   - Enter quiz score > 7
   - Click "Submit" → Should stay ON_TRACK
3. **Test failure**:
   - Start timer briefly (< 60s) OR enter score < 7
   - Click "Submit" → Should switch to NEEDS_INTERVENTION
4. **Wait for n8n/mentor**:
   - Mentor receives email
   - Mentor assigns task via n8n
   - App receives WebSocket event → switches to ASSIGNED_TASK
5. **Complete task**:
   - Click "Mark Complete" → switches back to ON_TRACK

## 🔐 Security Notes

- Student ID is hardcoded for demo purposes
- In production, implement proper authentication
- Use environment variables for configuration
- Enable CORS properly on backend

## 🐛 Troubleshooting

### WebSocket not connecting
- Check that backend URL is correct and accessible
- Verify WebSocket endpoint is `/ws/{student_id}`
- Check browser console for connection errors

### API calls failing
- Verify backend is deployed and running
- Check CORS settings on backend
- Inspect network tab for error responses

### Build errors
- Clear Expo cache: `npx expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## 📝 Notes

- This is a demo application showcasing the intervention engine concept
- The n8n automation and fail-safe timeout (12 hours) are configured on the backend
- Real-time updates rely on WebSocket connection; fallback to polling can be added if needed

## 🎨 Customization

To customize the UI:
- Edit styles in component files
- Change colors in `App.tsx` and component StyleSheets
- Modify the dark theme in `app.json` (`userInterfaceStyle`)

## 📄 License

This project is part of a coding assignment demonstrating intervention engine capabilities.

---

Built with ⚡ using Expo, React Native, and TypeScript
