// src/components/Layout.js
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";


import ProductPage from "./pages/ProductPage";
import OverviewPage from "./pages/OverviewPage";
import Sidebar from "./const/Sidebar";
import AddProductForm from "./components/products/AddProduct";
import UsersPage from "./pages/UsersPage";
import OrdersPage from "./pages/OrdersPage";
import SalesPage from "./pages/SalesPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import EditProductForm from "./components/products/EditProduct";
// import other pages as needed

const Layout = () => {
  const location = useLocation();

  // Conditionally hide sidebar for specific paths
  const hideSidebarPaths = ["/"]; // you can add more if needed

  const shouldShowSidebar = !hideSidebarPaths.includes(location.pathname);

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      {shouldShowSidebar && <Sidebar />}
      <div className="flex-grow">
        
        <Routes>
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/add-product" element={<AddProductForm />} />
          <Route path="/products/:id" element={<EditProductForm />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Add more nested routes here */}
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
