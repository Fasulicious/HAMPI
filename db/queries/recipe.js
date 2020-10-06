'use strict'

import Recipe from '../models/recipe'

export const getRecipe = (where, select) => Recipe.findOne(where).select(select)
