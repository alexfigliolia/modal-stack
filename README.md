# Modal Stack
A stack utility for managing open dialogs. Modals, toasts, drawer menus, and notifications have long-been an integral part of UI design, but few utilities exist for managing these views when they begin to overlap.

This tool aims to help developers manage overlapping UI views that user's can escape from either by clicking outside or tapping the escape key.

## Installation
```bash
npm i @figliolia/modal-stack
# or
yarn add @figliolia/modal-stack
```

## Basic Usage 
To begin using the modal stack to manage dialog-like UI elements create a `ModalStack` instance:
```typescript
// ModalStack.ts

import { ModalStack } from "@figliolia/modal-stack";

const Stack = new ModalStack();
```
Next, create `ModalToggle`'s for opening and closing your various UI dialogs:
```typescript
// Notification.ts

import { Stack } from "./ModalStack";

const show = (msg: string) => {
  const node = document.getElementById("notification");
  node.textContent = msg;
  node.style.display = "block";
}

const hide = () => {
  const node = document.getElementById("notification");
  node.textContent = "";
  node.style.display = "none"
}

const NotificationToggle = Stack.create(show, hide);

// To open your notification and add an entry onto the modal stack
NotificationToggle.open("Notification Message");

// If the user taps the escape key, your hide function will be called. When there are multiple entries or notifications on the stack, only the hide function for the top-most entry will be called each time the escape key is pressed

// To manually close the notification and clean up its entry on the stack
NotificationToggle.close();
```

## Cleaning Up
When user leaves a part of your app that contains open dialog UI's, it's usually pertantent to close each of the open dialogs before transitioning to a different part of your application. To do so, you can invoke the `cleanUp()` method on your `ModalStack` instance:

```typescript
import { ModalStack } from "@figliolia/modal-stack";

const Stack = new ModalStack();

// To close all open dialogs
Stack.closeAll();
```

## API
#### `ModalStack.push()`
Adds a callback to the top of the stack. This callback will be invoked if the user presses the escape key, or if `ModalStack.pop()` is manually invoked
```typescript
ModalStack.push(callback: () => void);
```

#### `ModalStack.pop()`
Removes the callback at the top of the stack and invokes it
```typescript
ModalStack.pop();
```
#### `ModalStack.create()`
Creates a `ModalToggle` instance. The `ModalToggle` exposes open and close methods that will automatically add or remove the associated UI from the stack
```typescript
const Toggle = ModalStack.create(
  (...args: any[]) => {
    // Open your UI dialog
  }, 
  () = {
    // Close UI dialog
  }
);
// To open the UI and add an entry on the to the stack
Toggle.open() 

// To close the UI and remove its entry from the stack
Toggle.close() 
```

#### `ModalStack.closeAll()`
Closes all open dialogs and removes them from the stack
```typescript
ModalStack.closeAll()
```