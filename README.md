# Modal Stack
A stack utility for managing open dialog-like elements. 

In the UI world it's possible to have more than one dialog opened at once - such as cases where you have custom dropdown menu or date-picker inside of an open dialog window.

This tool aims to help developers manage overlapping UI views by providing a simple interface that wraps the open and close logic of your dialog-like views.

Out of the box, you get:

1. Support for focus trapping
2. Escape key bindings for closing the top-most dialog-like element
3. A collision free experience when more than one open dialog-like element is open

## Installation
```bash
npm i @figliolia/modal-stack
# or
yarn add @figliolia/modal-stack
```

## Basic Usage 
Wrap your open and close logic for each dialog-like element in a `ModalToggle()`:

### Vanilla JS/TS
```typescript
// ExampleModal.ts
import { ModalToggle } from "./ModalStack";

const myModal = document.getElementById("myModal");

// Create Your Modal Toggle
const myModalToggle = new ModalToggle(
  () => myModal.style.display = "block", 
  () => myModal.style.display = "none",
  myModal // a reference to the modal element is optional
);        // but supplying it enables focus trapping when
          // your modal is open

// To open your modal
myModalToggle.open();

// To close your modal
myModalToggle.close();
```
### React
Below is an example using react and forwarded refs to create a modal component that can be controlled externally:
```tsx
import { 
  useRef,
  useState, 
  forwardRef,
  Fragment, 
  useImperativeHandle, 
  ForwardedRef 
} from "react";

import { useModalToggle } from "@figliolia/modal-stack";

// Create your modal
export const MyModal = forwardRef(function MyModal(
  { children },
  ref: ForwardedRef<ModalToggle>
) {
  const [open, setOpen] = useState(false);

  const toggle = useModalToggle(
    () => setOpen(true),
    () => setOpen(false)
  );

  // optionally expose your toggle outside of the component
  useImperativeHandle(ref, () => toggle, [toggle]);

  return (
    <div 
      role='dialog' 
      aria-modal={true} 
      aria-hidden={!open}
      // to optionally enable focus trapping
      ref={toggle.registerTrapNode}>
      <div>{children}</div>
    </div>
  );
});

// Use your Modal 
const App = () => {
  const modalToggle = useRef<ModalToggle>(null);

  // to open the modal
  toggle.current.open();

  // to close the modal
  toggle.current.close();

  return (
    <Fragment>
      <header>
        <Logo />
        <Navigation />
      </header>
      <main>
        <Content />
      <main>
      <Footer />
      <MyModal ref={modalToggle}>
        <h2>Hello, I'm a modal</h2>
        <p>I'm some modal content</p>
      </MyModal>
    </Fragment>
  );
}
```

### Motivation
While the package may be named `@figliolia/modal-stack`, this library can be used to manage popovers of any kind without influencing your markup, UI, or imposing rules upon your workflow. 

Simply wrap a dialog-like UI element's open/close logic in `new ModalToggle()` or `useModalToggle()` and your done!

## Cleaning Up
When user leaves a part of your app that contains open dialog-like UI, it's usually pertantent to close each of the open dialogs before transitioning to a different part of your application. To do so, you can invoke the `closeAll()` static method on the `ModalToggle`:

```typescript
import { ModalToggle } from "@figliolia/modal-stack";

ModalToggle.closeAll();
```

This will close any open modals, remove all key-bindings and deactivate focus traps.

## Want Just a Basic Focus Trap?
This library exposes its focus trapping logic via the `FocusTrap`. If you'd like to opt into focus trapping alone you can use the `FocusTrap` like so:

### Vanilla JS/TS
```typescript
import { FocusTrap } from "@figliolia/modal-stack";

// to trap focus on a DOM element
const trap = new FocusTrap(
  document.getElementById('nodeID');
);

// to temporarily pause/resume the trap
trap.pause();
trap.resume();

// to clean up the trap permanently
trap.destroy();
```

### React
If using react you can use `useFocusTrap()` inside of any component you wish to trap focus within
```tsx
import { useFocusTrap } from "@figliolia/modal-stack";

export const MyModal = ({ children }) => {
  const [nodeRef, focusTrap] = useFocusTrap();

  // focusTrap.current.pause?.(); to temporarily pause trapping
  // focusTrap.current.resume?.(); to resume after pausing

  return (
    <div 
      role='dialog' 
      aria-modal={true} 
      // to enable focus trapping
      ref={nodeRef}>
      <div>{children}</div>
    </div>
  );
});
```
## Popovers
While functionally similar to modals, popovers differ in that:
1. You don't trap focus inside of popovers
2. Popovers don't have to return focus to their triggers when closed

To support this difference in behavior, this library offers the `PopoverToggle` class as well as the `usePopoverToggle` react hook. 

They work identically to `ModalToggle` and `useModalToggle` while omitting the behaviors mentioned above.

## Migrating From Prior Versions
In the latest versions of `@figliolia/modal-stack`, the `ModalStack` utility is no longer exported. This means initializing an instance of `ModalStack` via `new ModalStack()` is no longer necessary.

If you were using `ModalStack.create()` to generate your toggles, you can now do so using `new ModalToggle(openFN, closeFN)` or `useModalToggle(openFN, closeFN)`.

The reason for this change is to simplify setup and diminish the possibility that more than one `ModalStack` exists at a time - perhaps if a dependency of your code is also using this library.

To fix that possibility the ModalStack now exists as a singleton that all `ModalToggles` share.

#### Closing All Modals / Destroying the Stack
`ModalStack.closeAll()` has been replaced with the static method `ModalToggle.closeAll()`.