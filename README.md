# Artist Vault

A sophisticated Next.js 14 application with Supabase authentication, featuring a clean art-gallery aesthetic for managing and showcasing your creative works.

## Features

- 🎨 **Art Gallery Aesthetic** - Clean, minimalist design inspired by art galleries
- 🔐 **Supabase Authentication** - Secure user authentication and authorization
- 📁 **Artist Vault** - Organized document management system
- 🎯 **TypeScript** - Full type safety throughout the application
- 💨 **Tailwind CSS** - Modern, responsive styling
- 🧩 **Shadcn UI** - Beautiful, accessible UI components
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd claude
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is ready, go to Settings > API
3. Copy your project URL and anon/public key

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL script in the SQL Editor

This will create:
- `profiles` table for user profiles
- `documents` table for the Artist Vault
- Row Level Security policies
- A storage bucket for documents
- Automatic profile creation trigger

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
claude/
├── app/
│   ├── dashboard/          # Dashboard page with Artist Vault
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── globals.css        # Global styles with CSS variables
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── input.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts     # Client-side Supabase client
│   │   └── server.ts     # Server-side Supabase client
│   └── utils.ts          # Utility functions
├── middleware.ts          # Auth middleware
├── supabase-schema.sql   # Database schema
└── components.json       # Shadcn UI config
```

## Database Schema

### Profiles Table

Stores user profile information:
- `id` (UUID) - References auth.users
- `email` (TEXT)
- `full_name` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Documents Table

Stores user documents for the Artist Vault:
- `id` (UUID)
- `user_id` (UUID) - References auth.users
- `title` (TEXT)
- `description` (TEXT)
- `file_url` (TEXT)
- `file_type` (TEXT)
- `file_size` (INTEGER)
- `thumbnail_url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Authentication Flow

1. Users sign up with email and password
2. Profile is automatically created via database trigger
3. Middleware protects dashboard routes
4. Users can view their personal documents
5. Row Level Security ensures data isolation

## Styling

The application uses a sophisticated art-gallery aesthetic with:
- Clean, minimal design
- Soft gradients and shadows
- Professional typography
- Smooth transitions and hover effects
- HSL-based color system for easy theming

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel project settings
4. Deploy

### Important Notes

- Make sure to add your environment variables in your deployment platform
- Update the Supabase Auth settings to include your production URL
- Configure proper CORS settings in Supabase

## Features to Add (Future Enhancements)

- [ ] Document upload functionality
- [ ] Image preview and thumbnails
- [ ] Document search and filtering
- [ ] Folder organization
- [ ] Sharing capabilities
- [ ] Dark mode toggle
- [ ] Profile editing
- [ ] Document tagging

## Security

- Row Level Security (RLS) enabled on all tables
- Secure authentication via Supabase
- Protected API routes
- Client and server-side validation
- Secure file storage with access policies

## Contributing

Feel free to open issues or submit pull requests for improvements.

## License

MIT License

## Support

For issues or questions, please open an issue in the GitHub repository.
