---
title: Pets
description: Pet packages, pet welcome lines and commands, breeding permission, horses and monster plants, and the tables behind them.
sidebar:
  order: 6.5
---

Pets live in rooms. They follow Habbo's rules for energy, happiness, levels, commands, food, drinks, nests and toys. Most of this needs no setup. This page lists the parts you can change.

For the small pets that walk with an avatar, see [pet companions](/features/pet-companions/).

## Pet packages

A pet package is a furni that holds a pet, such as "Your first Habbo Cat". The owner places it and double-clicks it. A dialog asks for the pet's name. Then the package turns into a furni, such as a nest, with the named pet on it.

A furni is a pet package when its `furniture` row has:

- `interaction_type = 'default'`.
- `custom_params` set to the pet type and the furni that the package turns into, separated by a space. For example, `1 newbie_nest` holds a cat and turns into `newbie_nest`.

The item's state holds the pet's look: the pet type, the breed and the colour, such as `1 0 ABABAB`.

These eggs and boxes need no `custom_params`. They hatch a pet of a random breed and leave no furni:

| Furni | Pet |
| --- | --- |
| `velociraptor_egg` | Velociraptor |
| `pterosaur_egg` | Pterosaur |
| `cowbox` | Cow, one of 20 breeds |
| `cowbox_gold` | Gold cow |

## Pet welcome lines

A pet says a welcome line when its owner places it, opens its package, or enters the room. The lines are in the `bots_pet_responses` table, one row per pet type:

| `pet_id` | `responses` |
| --- | --- |
| `welcome.speech.pet0` | `*Yay! You're home!*;*wags tail at %owner%*` |

- `welcome.speech.pet<type>` is the row for one pet type. `pet0` is the dog.
- Separate lines with `;`. The pet picks one at random.
- `%owner%` becomes the owner's name.

Migration 161 adds Habbo's lines and keeps lines your hotel already has. After a change, run `:update pet_locale`. It needs the `command.update_pet_locale` permission.

## Pet commands

The words that players type for pet commands are in `bots_pet_commands`. `id` is the client's command number (`pet.command.<id>`), and `input` is the word, such as `sit` for `1`. Migration 145 sets Habbo's English words. Pets learn commands by level, like on Habbo.

## Breeding permission

The owner can let other users breed with their pet. The choice is saved in `bots_petdata.allow_breeding` (migration 155). It is off by default.

## Horses

- Only a saddled horse can be ridden. The rider gets the riding effect of the saddle.
- Riders cannot sit on seats or lie on beds.
- Horse products, such as saddles and hair dyes, work as their `custom_params` in the furniture data say. Players can use them from the room or straight from the inventory.
- A removed saddle goes back to the owner's inventory.

## Monster plants

Players plant a monster plant seed in a room. The plant grows for 48 hours. Players treat the plant to keep it alive. A seedling can go 36 hours without treatment, and a grown plant 72 hours.

Each plant gets a random look and rarity. The pet info window and the inventory show its growth, wellbeing and rarity.

Monster plants need no setup. PlusEMU keeps their state in `bots_monsterplants` (migration 146).
