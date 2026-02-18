import { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  const openLogin = () => {
    setShowModal(true);
    setShowLoginModal(true);
    setShowForgotPasswordModal(false);
    setShowCreateAccountModal(false);
  };

  const openSignUp = () => {
    setShowModal(true);
    setShowLoginModal(false);
    setShowForgotPasswordModal(false);
    setShowCreateAccountModal(true);
  };

  const openForgotPassword = () => {
    setShowModal(true); // Should be true to show background
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
    setShowCreateAccountModal(false);
  };

  const closeModals = () => {
    setShowModal(false);
    setShowLoginModal(false);
    setShowForgotPasswordModal(false);
    setShowCreateAccountModal(false);
  };

  return (
    <ModalContext.Provider
      value={{
        showModal,
        showLoginModal,
        showForgotPasswordModal,
        showCreateAccountModal,
        openLogin,
        openSignUp,
        openForgotPassword,
        closeModals,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => useContext(ModalContext);
