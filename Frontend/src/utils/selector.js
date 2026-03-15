import { useSelector } from "react-redux";

// 🔐 Auth state
export const useAuth = () => {
  const { isAuthenticated, token, user } = useSelector((store) => store.user);
  return { isAuthenticated, token, user };
};

// 🧍 User Profile
export const useUserProfile = () => {
  const { profile } = useSelector((store) => store.user);
  return profile;
};

// 📦 App state (products, loading, etc.)
export const useAppState = () => {
  const { products, loading, error, currentPage } = useSelector(
    (store) => store.app
  );
  return { products, loading, error, currentPage };
};

// 📝 Form states
export const useFormData = () => {
  const { loginForm, registerForm, otpData } = useSelector(
    (store) => store.user
  );
  return { loginForm, registerForm, otpData };
};

// 📤 Product upload state
export const useProductState = () => {
  const { productForm, uploadLoading, uploadError, myProducts } = useSelector(
    (store) => store.product
  );
  return { productForm, uploadLoading, uploadError, myProducts };
};
