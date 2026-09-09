import { FeedbackDimension, Difficulty } from '../domain/enums';
import { RubricItem } from '../domain/Problem';

// ─── Parking Lot ───────────────────────────────────────────────────────────────

export const parkingLot = {
  title: 'Parking Lot System',
  difficulty: Difficulty.MEDIUM,
  prompt: `Design a Parking Lot system that manages the parking of vehicles of different sizes.

The system should:
- Support multiple vehicle types: Motorcycle, Car, Truck
- Support multiple spot types: Compact, Regular, Large
- Automatically assign the smallest available spot that fits a vehicle
- Issue and validate parking tickets
- Calculate parking fees based on duration and vehicle type
- Track occupancy in real time

A vehicle can only park in a spot of appropriate size (Motorcycle → any, Car → Regular or Large, Truck → Large only).

Your design should make it easy to add new vehicle types or fee calculation strategies in the future.`,
  constraints: [
    'Multiple floors are supported (Floor has Rows, each Row has Spots)',
    'A ticket is issued on entry and presented on exit to calculate fees',
    'Fee calculation must be pluggable (e.g. hourly, flat-rate, or surge)',
    'Thread-safety is out of scope for this exercise',
    'No database persistence required — in-memory state is fine',
  ],
  expectedConcepts: [
    'strategy', 'factory', 'interface', 'abstract', 'vehicle', 'spot', 'ticket',
    'fee', 'srp', 'ocp', 'parking', 'floor', 'slot', 'occupancy',
  ],
  rubric: [
    {
      dimension: FeedbackDimension.RESPONSIBILITY_ASSIGNMENT,
      description: 'ParkingLot, Floor, Row, Spot, Vehicle, Ticket should each be separate entities with clear single responsibilities.',
      weight: 0.25,
    },
    {
      dimension: FeedbackDimension.ABSTRACTION_QUALITY,
      description: 'Vehicle should be an abstract class/interface. FeeCalculator should be an interface. Spot should not know about fee logic.',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.EXTENSIBILITY,
      description: 'Adding a new vehicle type or fee strategy should require only a new class, not changes to ParkingLot.',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.SOLID_ADHERENCE,
      description: 'SRP: Ticket does not calculate fees. OCP: FeeCalculator is open for extension. DIP: ParkingLot depends on IFeeCalculator, not a concrete class.',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.PATTERN_CORRECTNESS,
      description: 'Strategy pattern for fee calculation. Factory (optional) for Spot/Vehicle creation. State on Spot (Available/Occupied).',
      weight: 0.10,
    },
    {
      dimension: FeedbackDimension.NAMING_CLARITY,
      description: 'Names like ParkingLot, ParkingSpot, ParkingTicket, FeeCalculator are domain-meaningful. Avoid generic names.',
      weight: 0.05,
    },
  ] as RubricItem[],
};

// ─── Elevator System ───────────────────────────────────────────────────────────

export const elevatorSystem = {
  title: 'Elevator Control System',
  difficulty: Difficulty.HARD,
  prompt: `Design an Elevator Control System for a building with multiple elevators and multiple floors.

The system should:
- Dispatch the most appropriate elevator in response to a hall call (floor + direction)
- Handle cabin calls (floor button pressed inside an elevator)
- Track each elevator's state: position, direction (UP/DOWN/IDLE), and door status
- Queue pending requests for each elevator
- Support a pluggable dispatch strategy (e.g. SCAN/LOOK algorithm or Nearest-Car)

Focus on the domain model and dispatch logic. UI, persistence, and physical hardware simulation are out of scope.`,
  constraints: [
    'Minimum of 2 elevators and 10 floors',
    'An elevator can only move in one direction at a time until it reverses',
    'The dispatch strategy must be swappable without changing Elevator or Floor classes',
    'Emergency stop puts an elevator into MAINTENANCE state — it should not receive new requests',
    'Concurrency/thread-safety is not required for this exercise',
  ],
  expectedConcepts: [
    'strategy', 'state', 'dispatch', 'elevator', 'floor', 'queue', 'direction',
    'interface', 'abstract', 'srp', 'ocp', 'scan', 'look', 'nearest',
  ],
  rubric: [
    {
      dimension: FeedbackDimension.RESPONSIBILITY_ASSIGNMENT,
      description: 'Elevator manages its own state. ElevatorController dispatches. DispatchStrategy decides which elevator. Floor/Button just emit events.',
      weight: 0.25,
    },
    {
      dimension: FeedbackDimension.ABSTRACTION_QUALITY,
      description: 'IDispatchStrategy interface. ElevatorState as enum or State pattern. Request as a value object.',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.EXTENSIBILITY,
      description: 'Swapping SCAN for Nearest-Car = swap DispatchStrategy implementation only. Adding new ElevatorState = only Elevator class changes.',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.SOLID_ADHERENCE,
      description: 'Elevator does not decide where to go (that is the strategy\'s job — DIP). Controller does not manage door state (SRP).',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.PATTERN_CORRECTNESS,
      description: 'Strategy for dispatch. State pattern (or enum + transition) for elevator state. Observer (optional) for floor arrival events.',
      weight: 0.10,
    },
    {
      dimension: FeedbackDimension.NAMING_CLARITY,
      description: 'ElevatorController, DispatchStrategy, ElevatorState, HallRequest, CabinRequest are clear domain names.',
      weight: 0.05,
    },
  ] as RubricItem[],
};

// ─── Vending Machine ───────────────────────────────────────────────────────────

export const vendingMachine = {
  title: 'Vending Machine',
  difficulty: Difficulty.EASY,
  prompt: `Design a Vending Machine that sells products and handles payments.

The system should:
- Allow a user to select a product by slot/code
- Accept coins and bills (insert money)
- Check if sufficient payment has been provided
- Dispense the selected product
- Return change
- Track inventory for each slot (quantity remaining)
- Handle the case when a product is sold out or insufficient funds are provided

The machine should have clearly separated states (Idle, HasMoney, Dispensing, ReturningChange).`,
  constraints: [
    'Only physical currency (no digital payment in MVP)',
    'Products are pre-loaded into the machine by an admin — no runtime add-product flow needed',
    'Refund of all inserted money must always be possible before selection',
    'Inventory goes to zero gracefully — machine shows "sold out", not an error',
    'No networking or persistence required',
  ],
  expectedConcepts: [
    'state', 'interface', 'abstract', 'product', 'slot', 'inventory', 'payment',
    'coin', 'change', 'dispense', 'srp', 'transition', 'idle',
  ],
  rubric: [
    {
      dimension: FeedbackDimension.RESPONSIBILITY_ASSIGNMENT,
      description: 'VendingMachine orchestrates. Slot manages its own inventory. Product is a value object. PaymentHandler processes money separately.',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.ABSTRACTION_QUALITY,
      description: 'VendingMachineState as an interface or abstract class so new states can be added. PaymentHandler as interface (extensible for digital later).',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.EXTENSIBILITY,
      description: 'Adding a digital payment method = implement PaymentHandler. Adding a new state = implement State interface. No changes to VendingMachine core.',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.SOLID_ADHERENCE,
      description: 'State pattern enforces that VendingMachine does not branch on machine state with if/else (OCP). Slot does not handle payment (SRP).',
      weight: 0.20,
    },
    {
      dimension: FeedbackDimension.PATTERN_CORRECTNESS,
      description: 'State pattern for machine states (Idle, HasMoney, Dispensing). Strategy or simple abstraction for payment. Factory optional.',
      weight: 0.15,
    },
    {
      dimension: FeedbackDimension.NAMING_CLARITY,
      description: 'VendingMachine, ProductSlot, Coin, CashPaymentHandler, IdleState etc. are domain-clear. No generic names.',
      weight: 0.05,
    },
  ] as RubricItem[],
};
