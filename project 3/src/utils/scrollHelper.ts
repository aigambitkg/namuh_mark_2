/**
 * Utility functions to handle scrolling behavior
 */

/**
 * Scrolls to the top of a specified element
 * @param elementRef React ref or element ID
 * @param options Scroll behavior options
 */
export const scrollToElement = (
  elementRef: React.RefObject<HTMLElement> | string,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
) => {
  if (!elementRef) return;
  
  // Handle both string IDs and React refs
  let element: HTMLElement | null = null;
  
  if (typeof elementRef === 'string') {
    element = document.getElementById(elementRef);
  } else if (elementRef.current) {
    element = elementRef.current;
  }
  
  if (element) {
    element.scrollIntoView(options);
  }
};

/**
 * Scrolls to the top of the page
 * @param behavior Scroll behavior ('auto' or 'smooth')
 */
export const scrollToTop = (behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({ top: 0, behavior });
};

/**
 * Scrolls to a specific position
 * @param top Y-coordinate to scroll to
 * @param behavior Scroll behavior ('auto' or 'smooth')
 */
export const scrollToPosition = (top: number, behavior: ScrollBehavior = 'smooth') => {
  window.scrollTo({ top, behavior });
};

/**
 * Scrolls to the top of an expanded section
 * @param sectionId The ID of the section that was just expanded
 * @param offset Optional pixel offset from the top
 */
export const scrollToExpandedSection = (sectionId: string, offset: number = 0) => {
  const section = document.getElementById(sectionId);
  if (section) {
    const position = section.getBoundingClientRect().top + window.scrollY - offset;
    scrollToPosition(position);
  }
};