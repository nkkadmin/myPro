package com.xsx.project.game.controller;

import com.xsx.project.game.po.Pintu;
import com.xsx.project.game.request.PintuChangeRequest;
import com.xsx.project.game.result.Result;
import com.xsx.project.game.service.PintuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @description:
 * @author: xieshengxiang
 * @date: 2019/6/25 20:16
 */
@RestController
@RequestMapping("/pintu")
public class PintuController {

    @Autowired
    private PintuService pintuService;

    /**
     * 重置游戏
     * @return
     */
    @RequestMapping("/initGame")
    public Result restart(){
        Result result = new Result(true);
        Pintu pintu = pintuService.initGame();
        result.setContent(pintu);
        return result;
    }

    /**
     *
     * @param pintuChangeRequest
     * @return
     */
    @RequestMapping("/change")
    public Result change(@RequestBody PintuChangeRequest pintuChangeRequest){
        Result result = new Result(true);
        //改变
        Pintu pintu = pintuService.change(pintuChangeRequest);
        result.setContent(pintu);
        //校验拼图是否完成
        Boolean success = pintuService.validateSuccess(pintu.getPintuButtons());
        result.setMsg(success ? "拼图成功" : null);
        return result;
    }

    /**
     * 恢复原图
     *
     * @return
     */
    @RequestMapping("/original")
    public Result original(){
        Result result = new Result(true);
        //改变
        Pintu pintu = new Pintu();
        result.setContent(pintu);
        return result;
    }

}
