import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";
import "./index.css";
import { AppShell } from "./components/AppShell.tsx";
import Home from "./pages/Home.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import Trending from "./pages/Trending.tsx";
import Submit from "./pages/Submit.tsx";
import Admin from "./pages/Admin.tsx";
import Auth from "./pages/Auth.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "blog",
        element: <Blog />,
      },
      {
        path: "blog/:slug",
        element: <BlogPost />,
      },
      {
        path: "trending",
        element: <Trending />,
      },
      {
        path: "submit",
        element: <Submit />,
      },
      {
        path: "admin",
        element: <Admin />,
      },
      {
        path: "auth",
        element: <Auth />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
