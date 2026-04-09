import { createBrowserRouter } from "react-router-dom";
import { Home } from "./pages/Home";
import { ManageCards } from "./pages/ManageCards";
import { StudyEnhanced } from "./pages/StudyEnhanced";
import { Statistics } from "./pages/Statistics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/cards",
    Component: ManageCards,
  },
  {
    path: "/study/:deckId",
    Component: StudyEnhanced,
  },
  {
    path: "/statistics",
    Component: Statistics,
  },
]);
