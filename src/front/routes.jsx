import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Single } from "./pages/Single";
import { Demo } from "./pages/Demo";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { FavoritesPage } from "./pages/Favorites";
import { ShoppingCart } from "./pages/ShoppingCart";

// Crea el router y define las rutas
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>}>
      <Route index element={<Home />} />
      <Route path="/single/:theId" element={<Single />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:product_id" element={<ProductDetail />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/shopping-cart" element={<ShoppingCart />} />
    </Route>
  )
);
