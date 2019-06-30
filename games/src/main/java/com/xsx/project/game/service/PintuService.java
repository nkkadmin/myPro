package com.xsx.project.game.service;

import com.xsx.project.game.po.Pintu;
import com.xsx.project.game.request.PintuChangeRequest;
import com.xsx.project.game.result.Result;

/**
 * @description:
 * @author: xieshengxiang
 * @date: 2019/6/25 20:18
 */
public interface PintuService {

    public Pintu initGame();

    Pintu change(PintuChangeRequest pintuChangeRequest);

    Boolean validateSuccess(Pintu.PintuButton[] pintuButtons);
}
