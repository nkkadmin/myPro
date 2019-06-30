package com.xsx.project.game.request;

import com.xsx.project.game.po.Pintu;

import java.io.Serializable;

/**
 * @description:
 * @author: xieshengxiang
 * @date: 2019/6/30 13:36
 */
public class PintuChangeRequest implements Serializable {

    private Pintu.PintuButton changeButton;

    private Pintu.PintuButton[] randomPintuButtons;

    public Pintu.PintuButton getChangeButton() {
        return changeButton;
    }

    public void setChangeButton(Pintu.PintuButton changeButton) {
        this.changeButton = changeButton;
    }

    public Pintu.PintuButton[] getRandomPintuButtons() {
        return randomPintuButtons;
    }

    public void setRandomPintuButtons(Pintu.PintuButton[] randomPintuButtons) {
        this.randomPintuButtons = randomPintuButtons;
    }
}
