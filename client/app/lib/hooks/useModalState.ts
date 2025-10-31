import { useState, useCallback } from "react";

export const useModalState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);
  const handleOpenModal2 = useCallback(() => setIsModal2Open(true), []);
  const handleCloseModal2 = useCallback(() => setIsModal2Open(false), []);

  return {
    isModalOpen,
    isModal2Open,
    handleOpenModal,
    handleCloseModal,
    handleOpenModal2,
    handleCloseModal2,
    setIsModal2Open,
  };
};

export default useModalState;
