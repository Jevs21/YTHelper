import { Modal, Box, Card, Stack } from "@suid/material";

const ModalEl = (props) => {

  return (
    <Modal {...props}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "50%",
          borderRadius: "8px",
          boxShadow: "24px",
          p: 4,
        }}
      >
        <Card>
          <Stack p={2} spacing={2}>
            {props.children}
          </Stack>
        </Card>
      </Box>
    </Modal>
  );
}

export default ModalEl;