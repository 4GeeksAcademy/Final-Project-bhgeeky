export const initialStore = () => {
  return {
    message: null,
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      },
    ],
    favorites: [],       
    products: [],        
  };
};

export default function storeReducer(state, action = {}) {
  switch (action.type) {
    case "set_hello":
      return {
        ...state,
        message: action.payload,
      };

    case "add_task":
      const { id, color } = action.payload;
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };

    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload,
      };

    case "SET_FAVORITES":
      return {
        ...state,
        favorites: action.payload.datafavorites
      };

    case "ADD_TO_FAVORITES":
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };

    case "REMOVE_FROM_FAVORITES":
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.uid !== action.payload.uid),
      };

    default:
      throw new Error("Unknown action.");
  }
}
