'use strict'

import Recipe from '../models/recipe'

export const getRecipe = (where, select) => Recipe.findOne(where).select(select)

export const createRecipe = (recipe) => Recipe.create(recipe)

export const updateRecipe = (where, update, options) => Recipe.findOneAndUpdate(where, update, options)
