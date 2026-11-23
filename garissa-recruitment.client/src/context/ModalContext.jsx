import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);

  const openLogin = useCallback(() => {
    setShowModal(true);
    setShowLoginModal(true);
    setShowForgotPasswordModal(false);
    setShowCreateAccountModal(false);
  }, []);

  const openSignUp = useCallback(() => {
    setShowModal(true);
    setShowLoginModal(false);
    setShowForgotPasswordModal(false);
    setShowCreateAccountModal(true);
  }, []);

  const openForgotPassword = useCallback(() => {
    setShowModal(true); // Should be true to show background
    setShowLoginModal(false);
    setShowForgotPasswordModal(true);
    setShowCreateAccountModal(false);
  }, []);

  const closeModals = useCallback(() => {
    setShowModal(false);
    setShowLoginModal(false);
    setShowForgotPasswordModal(false);
    setShowCreateAccountModal(false);
  }, []);

  const value = useMemo(() => ({
    showModal, showLoginModal, showForgotPasswordModal, showCreateAccountModal,
    openLogin, openSignUp, openForgotPassword, closeModals,
  }), [showModal, showLoginModal, showForgotPasswordModal, showCreateAccountModal, openLogin, openSignUp, openForgotPassword, closeModals]);

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useModal = () => useContext(ModalContext);
