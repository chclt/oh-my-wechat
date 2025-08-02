import type { Chat, User } from "@/lib/schema.ts";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

interface AppProviderContext {
  user: User | undefined;
  setUser: (user: User) => void;
  chat: Chat | undefined;
  setChat: (chat: Chat) => void;

  isOpenMediaViewer: boolean;
  setIsOpenMediaViewer: (isOpenMediaViewer: boolean) => void;

  registerIntersectionObserver: (
    element: Element,
    callback: () => void,
  ) => void;
}

const AppContext = createContext<AppProviderContext>({
  user: undefined,
  setUser: () => {},
  chat: undefined,
  setChat: () => {},

  isOpenMediaViewer: false,
  setIsOpenMediaViewer: () => {},

  registerIntersectionObserver: () => {},
});

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children, ...props }: AppProviderProps) => {
  // const [userList, setUserList] = useState<User[]>();
  const [user, setUser] = useState<User>();
  // useEffect(() => {
  //   if (user) {
  //     _global.user = user;
  //   } else {
  //     delete _global.user;
  //   }
  // }, [user]);

  const [chat, setChat] = useState<Chat>();

  const [isOpenMediaViewer, setIsOpenMediaViewer] = useState(false);

  // Intersection Observer
  const intersectionObserverRef = useRef<IntersectionObserver>();
  const entriesMap = useRef(new Map());
  const intersectionObserver = () => {
    if (!intersectionObserverRef.current) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const callback = entriesMap.current.get(entry.target);
              if (callback) {
                callback();
                intersectionObserverRef.current?.unobserve(entry.target);
                entriesMap.current.delete(entry.target);
              }
            }
          }
        },
        { rootMargin: "0px" },
      );
    }
    return intersectionObserverRef.current;
  };
  const registerIntersectionObserver = useCallback(
    (element: Element, callback: () => void) => {
      if (element) {
        entriesMap.current.set(element, callback);
        intersectionObserver().observe(element);
      }
    },
    [],
  );

  return (
    <AppContext.Provider
      value={{
        ...props,
        user,
        setUser,
        chat,
        setChat,

        isOpenMediaViewer,
        setIsOpenMediaViewer,

        registerIntersectionObserver,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within a AppProvider");
  }
  return context;
};
