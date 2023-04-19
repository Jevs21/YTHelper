import { Button } from "@suid/material";

const ButtonEl = (props) => (
  <Button 
    {...props}
    variant="contained">{props.children}</Button>
);

export default ButtonEl;