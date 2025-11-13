/**
 * useModal Hook
 *
 * Simplified modal state management hook.
 * Replaces multiple boolean useState declarations with a single unified API.
 *
 * Benefits:
 * - Less boilerplate code
 * - Consistent modal management pattern
 * - Easy to add new modals
 * - Centralized modal state
 *
 * Usage:
 *   const modals = useModal();
 *
 *   // Open a modal
 *   modals.open('editAreas');
 *
 *   // Check if modal is open
 *   {modals.isOpen('editAreas') && <EditAreasModal ... />}
 *
 *   // Close a modal
 *   modals.close('editAreas');
 */

import { useState, useCallback } from 'react';

export type ModalId =
  | 'editAreas'
  | 'taskForce'
  | 'commandCenter'
  | 'cardEditor'
  | 'adminLogin'
  | 'combatStats'
  | 'deploymentNotification'
  | 'playerAssignment'
  | 'factionChange'
  | 'campaignIntro'
  | 'unassignedPlayersWarning';

export interface UseModalReturn {
  /**
   * Open a modal by its ID
   */
  open: (modalId: ModalId) => void;

  /**
   * Close a modal by its ID
   */
  close: (modalId: ModalId) => void;

  /**
   * Toggle a modal's open state
   */
  toggle: (modalId: ModalId) => void;

  /**
   * Check if a modal is currently open
   */
  isOpen: (modalId: ModalId) => boolean;

  /**
   * Close all modals
   */
  closeAll: () => void;

  /**
   * Get array of currently open modal IDs
   */
  getOpenModals: () => ModalId[];
}

/**
 * Hook for managing multiple modal states
 */
export function useModal(): UseModalReturn {
  const [openModals, setOpenModals] = useState<Set<ModalId>>(new Set());

  const open = useCallback((modalId: ModalId) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.add(modalId);
      return next;
    });
  }, []);

  const close = useCallback((modalId: ModalId) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      next.delete(modalId);
      return next;
    });
  }, []);

  const toggle = useCallback((modalId: ModalId) => {
    setOpenModals(prev => {
      const next = new Set(prev);
      if (next.has(modalId)) {
        next.delete(modalId);
      } else {
        next.add(modalId);
      }
      return next;
    });
  }, []);

  const isOpen = useCallback((modalId: ModalId) => {
    return openModals.has(modalId);
  }, [openModals]);

  const closeAll = useCallback(() => {
    setOpenModals(new Set());
  }, []);

  const getOpenModals = useCallback((): ModalId[] => {
    return Array.from(openModals);
  }, [openModals]);

  return {
    open,
    close,
    toggle,
    isOpen,
    closeAll,
    getOpenModals
  };
}

/**
 * Alternative: Individual modal hook
 * Use this if you need a single modal with more control
 *
 * Usage:
 *   const editModal = useModalState();
 *   editModal.open();
 *   editModal.close();
 *   editModal.isOpen // boolean
 */
export function useModalState(initialState: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle
  };
}
