# Student Management System

A comprehensive student management system built with Vue 3, TypeScript, and Ant Design Vue.

## Features

- User authentication (Login/Register)
- Student score management
- Score analysis and visualization
- Role-based access control

## Tech Stack

- Vue 3
- TypeScript
- Ant Design Vue
- Axios
- Pinia
- Vue Router

## Project Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

# Build for production
npm run build

# Run type check
npm run type-check

# Lint and fix files
npm run lint
```

## Environment Variables

Copy `.env.example` to `.env` and adjust the values:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
src/
├── api/          # API integration
├── assets/       # Static assets
├── components/   # Vue components
├── router/       # Vue Router configuration
├── stores/       # Pinia stores
├── types/        # TypeScript types
└── views/        # Page components
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
