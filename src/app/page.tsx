// app/page.tsx

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to /magasin when visiting the root URL
  redirect('/magasin');
}
