import { MessageFormData } from "@minecraft/server-ui";

class UIUtils {
  handleError = (player, source, error) => {
    if (player?.isValid) {
      player.sendMessage("§c[Shop] เกิดข้อผิดพลาดในการเปิดเมนู");
    }
    const message = error?.stack ?? error?.message ?? String(error);
    console.error(`[Shop] ${source}: ${message}`);
  };

  showForm = (player, form, source, onSubmit) => {
    return form
      .show(player)
      .then((res) => {
        if (!player?.isValid) return;
        onSubmit(res);
      })
      .catch((error) => this.handleError(player, source, error));
  };

  showMessage = (
    player,
    { title, body, btn1 = "ยืนยัน", btn2 = "ยกเลิก", source = "ui.message" },
    onSubmit,
  ) => {
    const form = new MessageFormData()
      .title(title)
      .body(body)
      .button1(btn1)
      .button2(btn2);

    return this.showForm(player, form, source, onSubmit);
  };

  confirm = (player, onConfirm, onCancel) => {
    this.showMessage(
      player,
      {
        title: "ยืนยัน",
        body: "คุณแน่ใจหรือไม่?",
        btn1: "ยืนยัน",
        btn2: "ยกเลิก",
        source: "sure",
      },
      (res) => {
        if (res.canceled || res.selection !== 0) {
          if (onCancel) onCancel();
        } else {
          onConfirm();
        }
      },
    );
  };
}

export default new UIUtils();
