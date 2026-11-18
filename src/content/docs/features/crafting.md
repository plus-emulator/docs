---
title: Crafting
description: Set up crafting altars and recipes, secret recipes, limited recipes, and crafting achievements.
sidebar:
  order: 5.3
---

Crafting turns furni into new furni. A player puts the ingredients into a crafting altar in a room and gets the reward. PlusEMU reads the recipes from the database on every use, so a change works at once.

## The crafting tables

| Table | What it holds |
| --- | --- |
| `crafting_recipes` | One row per recipe. |
| `crafting_recipes_ingredients` | The ingredients of each recipe: `recipe_id`, `item_id` (a `furniture.id`) and `amount` (1 to 50). |
| `crafting_altars_recipes` | Which altar has which recipe: `altar_item_id` (the altar's `furniture.id`) and `recipe_id`. |
| `user_crafting_recipes` | The secret recipes each player has found. PlusEMU fills it. |

### `crafting_recipes`

| Column | Default | What it does |
| --- | --- | --- |
| `code` | | A unique code. It is case-sensitive. |
| `product_code` | | The product code that the client shows. |
| `reward_item_id` | | The `furniture.id` the player gets. It must be a floor or wall item. |
| `enabled` | `1` | `0` turns the recipe off. |
| `secret` | `0` | `1` hides the recipe until a player finds it. |
| `remaining` | `NULL` | How many more times the recipe can be used. `NULL` means no limit. At `0` the recipe is gone. |
| `achievement` | `''` | An achievement group that goes up by 1 with each craft. |

`altar_item_id` is the furniture definition, not one placed altar. All altars of that type get the recipe.

## Add a recipe

This example uses furniture IDs from a test database. Use the IDs of your own `furniture` table. Altar `1000` turns 3 of item `2001` and 1 of item `2002` into item `3001`:

```sql
INSERT INTO crafting_recipes (code, product_code, reward_item_id)
VALUES ('acme_lamp', 'acme_lamp', 3001);
SET @recipe = LAST_INSERT_ID();

INSERT INTO crafting_altars_recipes (altar_item_id, recipe_id) VALUES (1000, @recipe);
INSERT INTO crafting_recipes_ingredients (recipe_id, item_id, amount)
VALUES (@recipe, 2001, 3), (@recipe, 2002, 1);
```

Fresh databases have the Habbocalypse crafting altar (`hween_c15_altar`) with 24 recipes.

## Rules

- The player must own the altar and be in the room with it.
- The ingredients come from the player's inventory. Limited edition items cannot be used.
- One craft uses at most 50 items in total.
- A recipe whose reward or ingredient furni is missing from the `furniture` table is hidden.

## Secret recipes

A recipe with `secret = 1` is not in the list. A player finds it by putting exactly its ingredients into the altar. After that, PlusEMU saves it in `user_crafting_recipes` and the player sees it in the list.

## Achievements

- Every craft adds 1 to `ACH_Atcg`.
- Finding a secret recipe also adds 1 to `ACH_AtcgSecret`.
- The recipe's `achievement` column adds 1 to that achievement group.

## Troubleshooting

- **The altar shows no recipes.** Check `crafting_altars_recipes.altar_item_id`: it must be the altar's `furniture.id`. Check that the reward and every ingredient exist in `furniture`.
- **A recipe disappeared.** Check `enabled` and `remaining`.
