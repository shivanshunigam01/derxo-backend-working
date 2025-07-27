import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import MedicineList from "./pages/medicines/MedicineList";
import MedicineForm from "./pages/medicines/MedicineForm";
import BlogList from "./pages/blogs/BlogList";
import BlogForm from "./pages/blogs/BlogForm";
import FAQList from "./pages/faqs/FAQList";
import HeroSection from "./pages/hero/HeroSection";
import Testimonials from "./pages/testimonials/TestimonialList";
import Contacts from "./pages/contacts/ContactList";
import Newsletter from "./pages/newsletter/Newsletter";
import PrivateRoute from "./components/PrivateRoute";
import Categories from "./pages/medicines/Categories";
import CategoryMedicines from "./pages/medicines/CategoryMedicines";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Categories />} />
            <Route path="medicines" element={<Categories />} />
            <Route path="medicines/add" element={<MedicineForm />} />
            <Route path="medicines/edit/:url" element={<MedicineForm />} />
            <Route path="medicines/edit/:id/:category" element={<MedicineForm />} />
           <Route
              path="medicines/category/:category"
              element={<CategoryMedicines />}
            />
            <Route path="blogs" element={<BlogList />} />
            <Route path="blogs/add" element={<BlogForm />} />
            <Route path="blogs/edit/:url" element={<BlogForm />} />
            <Route path="faqs" element={<FAQList />} />
            <Route path="hero-section" element={<HeroSection />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="newsletter" element={<Newsletter />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
