import { get } from 'svelte/store';

import BUILDINGS from '../data/buildings';
import SOLDIERS from '../data/soldiers';

import army from '../stores/army';
import demons from '../stores/demons';
import food from '../stores/food';
import gameOver from '../stores/gameOver';
import turn from '../stores/turn';
import villageMap from '../stores/villageMap';
import worldMap from '../stores/worldMap';


function produceResources() {
    worldMap.getHumanVillages().forEach(village => {
        const buildings = get(village.map).flat()
            .filter(t => t !== villageMap.EMPTY_TILE)
            .filter(t => t.building && t.level > 0)
            .filter(
                t => BUILDINGS[t.building].category === BUILDINGS.CATEGORIES.PRODUCTION
            );

        buildings.forEach(tile => {
            const output = BUILDINGS[tile.building].output[tile.level];
            for (const resource in output) {
                if (resource === 'food') {
                    food.gain(output[resource]);
                }
                else {
                    village.resources.gain(resource, output[resource]);
                }
            }
        });
    });
}


function eatFood() {
    const soldiers = get(army);
    const foodToEat = Object.keys(soldiers).reduce(
        (food, type) => food + (soldiers[type] * SOLDIERS[type].foodIntake),
        0
    );

    if (foodToEat > get(food)) {
        // There's not enough food, some soldiers will die.
        army.starvation();
    }
    else {
        army.belliesFilled();
    }

    food.lose(foodToEat);
}


function build() {
    worldMap.getHumanVillages().forEach(village => {
        village.map.build();
    });
}


function recruitSoldiers() {
    let soldiers = [];
    worldMap.getHumanVillages().forEach(village => {
        soldiers = soldiers.concat(village.map.recruit());
    });
    army.recruit(soldiers);
}


function resolveAttack() {
    if (demons.areAttackingThisTurn()) {
        // Compute army's strength.
        const soldiers = get(army);
        const armyStrength = Object.keys(soldiers).reduce(
            (s, t) => s + (soldiers[t] * SOLDIERS[t].strength),
            0
        );
        const demonsStrength = get(demons);

        if (armyStrength > demonsStrength * 1.2) {
            // Glorious victory, no losses.
            console.debug('glory!');
        }
        else if (armyStrength < demonsStrength * 0.8) {
            // Dramatic loss, game over.
            gameOver.lose();
        }
        else {
            // Draw, your army takes some losses.
            const combatResult = ( demonsStrength * 1.2 ) - armyStrength;
            const percent = combatResult / armyStrength * 100;
            army.loseSoldiers(percent);
        }
    }
}


export default function endTurn() {
    produceResources();
    eatFood();
    build();
    recruitSoldiers();
    resolveAttack();
    turn.next();
    demons.computeNextStrength();
}
