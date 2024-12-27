"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

type AlertData = {
  visible: boolean,
  message: string;
  status: number;
};

type MyContextType = {
  name: string;
  setName: (user: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  alertData: AlertData,
  setAlertData: (data: AlertData) => void;
  spinner : boolean;
  setSpinner : (spinner : boolean) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

export const MyContextProvider = ({ children }: { children: ReactNode }) => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [alertData, setAlertData] = useState<AlertData>({
    visible: false,
    message: '',
    status: 0
  })
  const [spinner, setSpinner] = useState<boolean>(false);

  return (
    <MyContext.Provider value={{ name, setName, email, setEmail, password, setPassword, alertData, setAlertData, spinner, setSpinner }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) throw new Error('useMyContext must be used within a MyContextProvider');
  return context;
};