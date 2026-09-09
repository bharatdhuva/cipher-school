import { ProblemModel } from '../infrastructure/ProblemModel';
import { parkingLot, elevatorSystem, vendingMachine } from './problems';

export async function seedProblems(): Promise<void> {
  const count = await ProblemModel.countDocuments();
  if (count > 0) {
    console.log(`[Seed] Skipping — ${count} problems already exist.`);
    return;
  }

  await ProblemModel.insertMany([parkingLot, elevatorSystem, vendingMachine]);
  console.log('[Seed] Inserted 3 seed problems: Parking Lot, Elevator System, Vending Machine.');
}
