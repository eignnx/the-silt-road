import { Form, useFetcher, useLoaderData } from 'react-router-dom';
import { addToPlayerCaravan, Caravan, displayWagon, DRAFT_ANIMALS, DraftAnimal, getPlayerCaravan, pluralizeDraftAnimal, Wagon, WAGONS } from '../model/PlayerCaravan';
import "../CaravanEditor.css";
import { titleCase } from '../utils';

export async function caravanEditorLoader() {
    return { caravan: await getPlayerCaravan() };
}

export async function caravanEditorAction({ request }: { request: any; }) {
    const formData = await request.formData();
    const { _action, ...updates } = Object.fromEntries(formData);

    switch (_action) {
        case "addDraftAnimal": {
            return await addToPlayerCaravan({
                draftAnimals: {
                    [updates.draftAnimalKind]: 1,
                },
            });
        }
        case "removeDraftAnimal": {
            return await addToPlayerCaravan({
                draftAnimals: {
                    [updates.draftAnimalKind]: -1,
                },
            });
        }
        case "addWagon": {
            return await addToPlayerCaravan({
                wagons: {
                    [updates.wagonKind]: 1,
                },
            });
        }
        case "removeWagon": {
            return await addToPlayerCaravan({
                wagons: {
                    [updates.wagonKind]: -1,
                },
            });
        }
        default: {
            throw new Error(`Unhandled form submission action: ${_action}`);
        }
    }
}

export default function CaravanEditor() {
    const { caravan } = useLoaderData() as { caravan: Caravan; };
    const fetcher = useFetcher();

    return (
        <>
            <h1>Caravan</h1>
            <h2>Draft Animals</h2>
            <ul>
                {Object.entries(caravan.draftAnimals).map(([animal, qty]) => (
                    <li key={animal}>
                        <fetcher.Form method="PATCH">
                            <span className='input-row'>
                                <span>
                                    {String(qty)} {pluralizeDraftAnimal(animal as DraftAnimal, qty)}
                                </span>
                                <button type="submit">Remove</button>
                            </span>
                            <input type="hidden" name="_action" value="removeDraftAnimal" />
                            <input type="hidden" name="draftAnimalKind" value={animal} />
                        </fetcher.Form>
                    </li>
                ))}
            </ul>
            <h2>Wagons</h2>
            <ul>
                {Object.entries(caravan.wagons).map(([wagon, qty]) => (
                    <li key={wagon}>
                        <fetcher.Form method="PATCH">
                            <span className="input-row">
                                <span>{titleCase(displayWagon(wagon as Wagon))}s:</span>
                                <span>{String(qty)}x</span>
                                <button type="submit">Remove</button>
                            </span>
                            <input type="hidden" name="_action" value="removeWagon" />
                            <input type="hidden" name="wagonKind" value={wagon} />
                        </fetcher.Form>
                    </li>
                ))}
            </ul>

            <h2>Caravan Additions</h2>
            <fetcher.Form method="PATCH">
                <input type="hidden" name="_action" value="addDraftAnimal" />
                <label>
                    <span>Add Draft Animal</span>
                    <select name="draftAnimalKind">
                        {DRAFT_ANIMALS.map(animal => (
                            <option key={animal} value={animal}>{animal}</option>
                        ))}
                    </select>
                </label>
                <button type="submit">Add Animal</button>
            </fetcher.Form>

            <fetcher.Form method="PATCH">
                <input type="hidden" name="_action" value="addWagon" />
                <label>
                    <span>Add Wagon</span>
                    <select name="wagonKind">
                        {WAGONS.map(wagon => (
                            <option key={wagon} value={wagon}>{wagon}</option>
                        ))}
                    </select>
                </label>
                <button type="submit">Add Wagon</button>
            </fetcher.Form>
        </>
    );
};