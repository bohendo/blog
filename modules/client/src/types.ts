export type ServerConfig = {
  contentBranch: string;
  contentDir: string;
  contentUrl: string;
}

export type PostData = {
  category: string;
  content?: string;
  featured?: string;
  lastEdit: string;
  img?: string;
  path: string;
  slug: string;
  tags: string[];
  title: string;
  tldr: string;
};

export type PostIndex = {
  posts: { [slug: string]: PostData };
  style?: any;
  title: string;
}

// Types for Food logger

export type Nutrients = { /* nutrient percentage */
  carbohydrates: number;
  protein: number;
  fat: number;
  calories: number;
};

// Basic constituents of the Dish like cheese, mushroom, potato
export type Ingredient = {
  name: string;
  quantity: string; /* quantity in grams */
  nutrients: Nutrients;
};

export type Dish = {
  name: string;
  serving: number; /* serving size in grams */
  ingredients: Ingredient[];
}

export type FoodLog = {
  [date: string]: {
    [time: string]: Dish[];
  };
}

export type FitnessProfile = {
  name: string;
  age: number;
  height: string;
  foodLog: FoodLog;
}
