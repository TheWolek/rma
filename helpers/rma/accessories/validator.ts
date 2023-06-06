const accessoriesArrayValidator = (
  accessories: Array<number>
): [boolean, string] => {
  if (accessories === undefined || accessories === null) {
    return [false, "Pole deviceAccessories jest wymagane"];
  }

  if (!Array.isArray(accessories)) {
    return [false, "zły format pola deviceAccessories"];
  }
  if (accessories.length !== 0) {
    accessories.forEach((el: number) => {
      if (!Number.isInteger(el)) {
        return [false, "zły format pola deviceAccessories"];
      }
    });
  }

  return [true, ""];
};

export default accessoriesArrayValidator;
