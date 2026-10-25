const CountUp = ({ target, suffix = '', className = '', style = {} }) => {
  return (
    <span className={className} style={style}>
      {target.toLocaleString('en-US')}{suffix}
    </span>
  );
};

export default CountUp;
