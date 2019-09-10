const round = (value, decimals) =>
  Number(Math.round(value+'e'+decimals)+'e-'+decimals);

export default round;
