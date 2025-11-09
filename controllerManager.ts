export type ControllerButton = 
  | 'up' | 'down' | 'left' | 'right' 
  | 'a' | 'b' | 'x' | 'y'
  | 'lb' | 'rb' | 'lt' | 'rt'
  | 'start' | 'select'
  | 'leftStick' | 'rightStick';

export type ControllerType = 'xbox' | 'playstation' | 'generic';

interface ButtonState {
  pressed: boolean;
  value: number;
}

class ControllerManager {
  private controllers: Map<number, Gamepad> = new Map();
  private buttonStates: Map<number, Map<number, ButtonState>> = new Map();
  private connected: boolean = false;
  private controllerType: ControllerType = 'generic';
  private deadzone: number = 0.15;
  private usingController: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('gamepadconnected', this.handleConnect.bind(this));
      window.addEventListener('gamepaddisconnected', this.handleDisconnect.bind(this));
    }
  }

  private handleConnect(e: GamepadEvent) {
    const gamepad = e.gamepad;
    this.controllers.set(gamepad.index, gamepad);
    this.buttonStates.set(gamepad.index, new Map());
    this.connected = true;
    this.detectControllerType(gamepad);
    console.log(`🎮 Controller connected: ${gamepad.id} (${this.controllerType})`);
  }

  private handleDisconnect(e: GamepadEvent) {
    const gamepad = e.gamepad;
    this.controllers.delete(gamepad.index);
    this.buttonStates.delete(gamepad.index);
    this.connected = this.controllers.size > 0;
    console.log('🎮 Controller disconnected:', gamepad.id);
  }

  private detectControllerType(gamepad: Gamepad) {
    const id = gamepad.id.toLowerCase();
    
    // PlayStation controllers
    if (id.includes('dualshock') || 
        id.includes('ps3') || 
        id.includes('ps4') || 
        id.includes('ps5') ||
        id.includes('playstation') ||
        id.includes('dualsense')) {
      this.controllerType = 'playstation';
    }
    // Xbox controllers
    else if (id.includes('xbox') || 
             id.includes('xinput') || 
             id.includes('microsoft')) {
      this.controllerType = 'xbox';
    }
    // Generic
    else {
      this.controllerType = 'generic';
    }
  }

  public update() {
    if (!this.connected) return;

    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        this.controllers.set(gamepad.index, gamepad);
      }
    }
  }

  public getButton(button: ControllerButton): boolean {
    if (!this.connected) return false;

    const controller = Array.from(this.controllers.values())[0];
    if (!controller) return false;

    const buttonIndex = this.getButtonIndex(button);
    if (buttonIndex === -1) return false;

    const gamepadButton = controller.buttons[buttonIndex];
    if (!gamepadButton) return false;

    const isPressed = gamepadButton.pressed || gamepadButton.value > 0.5;
    
    if (isPressed) {
      this.usingController = true;
    }

    return isPressed;
  }

  public getButtonPressed(button: ControllerButton): boolean {
    if (!this.connected) return false;

    const controller = Array.from(this.controllers.values())[0];
    if (!controller) return false;

    const buttonIndex = this.getButtonIndex(button);
    if (buttonIndex === -1) return false;

    const states = this.buttonStates.get(controller.index);
    if (!states) return false;

    const gamepadButton = controller.buttons[buttonIndex];
    if (!gamepadButton) return false;

    const currentState = gamepadButton.pressed || gamepadButton.value > 0.5;
    const previousState = states.get(buttonIndex)?.pressed || false;

    states.set(buttonIndex, { pressed: currentState, value: gamepadButton.value });

    return currentState && !previousState;
  }

  private getButtonIndex(button: ControllerButton): number {
    // Standard gamepad mapping
    const mapping: Record<ControllerButton, number> = {
      'a': 0,           // Cross on PlayStation
      'b': 1,           // Circle on PlayStation
      'x': 2,           // Square on PlayStation
      'y': 3,           // Triangle on PlayStation
      'lb': 4,          // L1
      'rb': 5,          // R1
      'lt': 6,          // L2
      'rt': 7,          // R2
      'select': 8,      // Share/Select
      'start': 9,       // Options/Start
      'leftStick': 10,  // L3
      'rightStick': 11, // R3
      'up': 12,         // D-pad up
      'down': 13,       // D-pad down
      'left': 14,       // D-pad left
      'right': 15,      // D-pad right
    };

    return mapping[button] ?? -1;
  }

  public getAxis(stick: 'left' | 'right', axis: 'x' | 'y'): number {
    if (!this.connected) return 0;

    const controller = Array.from(this.controllers.values())[0];
    if (!controller) return 0;

    let axisIndex = 0;
    if (stick === 'left') {
      axisIndex = axis === 'x' ? 0 : 1;
    } else {
      axisIndex = axis === 'x' ? 2 : 3;
    }

    const value = controller.axes[axisIndex] || 0;
    
    // Apply deadzone
    if (Math.abs(value) < this.deadzone) {
      return 0;
    }

    if (value !== 0) {
      this.usingController = true;
    }

    return value;
  }

  public getMovement(): { x: number; y: number } {
    const x = this.getAxis('left', 'x');
    const y = this.getAxis('left', 'y');

    // Also check D-pad
    let dpadX = 0;
    let dpadY = 0;

    if (this.getButton('left')) dpadX = -1;
    if (this.getButton('right')) dpadX = 1;
    if (this.getButton('up')) dpadY = -1;
    if (this.getButton('down')) dpadY = 1;

    return {
      x: dpadX || x,
      y: dpadY || y
    };
  }

  public getCursorMovement(): { x: number; y: number } {
    const x = this.getAxis('right', 'x');
    const y = this.getAxis('right', 'y');

    return { x, y };
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getControllerType(): ControllerType {
    return this.controllerType;
  }

  public isUsingController(): boolean {
    return this.usingController;
  }

  public resetControllerFlag() {
    this.usingController = false;
  }

  public getScrollInput(): number {
    // Returns -1 for scroll up, 1 for scroll down, 0 for no scroll
    if (!this.connected) return 0;

    // Check shoulder buttons
    if (this.getButton('lb')) return -1;
    if (this.getButton('rb')) return 1;

    // Check D-pad (alternative scrolling method)
    if (this.getButtonPressed('up')) return -1;
    if (this.getButtonPressed('down')) return 1;

    return 0;
  }

  public vibrate(duration: number = 200, weakMagnitude: number = 0.5, strongMagnitude: number = 0.5) {
    if (!this.connected) return;

    const controller = Array.from(this.controllers.values())[0];
    if (!controller || !controller.vibrationActuator) return;

    controller.vibrationActuator.playEffect('dual-rumble', {
      duration,
      weakMagnitude,
      strongMagnitude
    });
  }
}

export const controllerManager = new ControllerManager();
