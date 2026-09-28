'use client';
import { SignOut } from '@/actions/auth';
import { cn } from '@/lib/utils';
import { LoaderCircle } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import { removeCookie } from 'typescript-cookie';
import { useLocalStorage } from 'usehooks-ts';

const LogoutProvider = () => {
  const [, , removeValue] = useLocalStorage('user', {});

  useEffect(() => {
    SignOut().then(() => {
      removeCookie('token', { path: '/' });
      removeCookie('token', { path: '/auth' });
      removeValue();
      redirect('/auth/login');
    });
  }, [removeValue]);

  return (
    <div className={cn('flex justify-center items-center w-full h-80')}>
      <div className="w-full h-full bg-accent animate-pulse rounded-md p-4"></div>
      <div className="absolute px-6 text-center flex flex-col justify-center items-center">
        <LoaderCircle className="mb-1 size-10 md:size-15 lg:size-20 animate-spin" />
        <span className="text-sm font-bold">Logging out...</span>
      </div>
    </div>
  );
};

export default LogoutProvider;
