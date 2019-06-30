package com.xsx.project.game.service.impl;

import com.xsx.project.game.contants.Constant;
import com.xsx.project.game.po.Pintu;
import com.xsx.project.game.request.PintuChangeRequest;
import com.xsx.project.game.result.Result;
import com.xsx.project.game.service.PintuService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

/**
 * @description:
 * @author: xieshengxiang
 * @date: 2019/6/25 20:19
 */
@Service
public class PintuServiceImpl implements PintuService {


    @Override
    public Pintu initGame() {
        Pintu pintu = new Pintu();
        pintu.setPintuButtons(null);
        String[] source = Arrays.copyOf(Constant.IMG_ARR,Constant.IMG_ARR.length);
        int len = source.length;
        Pintu.PintuButton[] pintuButtonArr = new Pintu.PintuButton[len];
        Pintu.PintuButton pintuButton = null;
        for(int i = 0;i<source.length;i++){
            int randomIndex = new Random().nextInt(len - i);
            String temp = source[randomIndex];
            source[randomIndex] = source[len - i - 1];
            source[len - i - 1] = temp;
            pintuButton = new Pintu.PintuButton();
            pintuButton.setPosition(i);
            pintuButton.setIcon(temp);
            pintuButtonArr[i] = pintuButton;
        }
        pintu.setPintuButtons(pintuButtonArr);
        return pintu;
    }

    @Override
    public Pintu change(PintuChangeRequest pintuChangeRequest) {
        Integer changePosition = changeToPosition(pintuChangeRequest);
        Pintu pintu = new Pintu();
        if(changePosition >= 0){
            Pintu.PintuButton[] pintuButtons = changePosition(changePosition,pintuChangeRequest);
            pintu.setPintuButtons(pintuButtons);
        }else{
            pintu.setPintuButtons(null);
        }
        return pintu;
    }

    /**
     * 交换icon值
     * @param newPosition
     * @return
     */
    private Pintu.PintuButton[] changePosition(Integer newPosition,PintuChangeRequest pintuChangeRequest){
        Pintu.PintuButton[] randomPintuArr = pintuChangeRequest.getRandomPintuButtons();
        Integer oldPosition = pintuChangeRequest.getChangeButton().getPosition();
        String tempIcon = randomPintuArr[oldPosition].getIcon();
        String newIcon = randomPintuArr[newPosition].getIcon();
        randomPintuArr[newPosition].setIcon(tempIcon);
        randomPintuArr[oldPosition].setIcon(newIcon);
        return randomPintuArr;
    }

    /**
     * 校验是否能移动,可移动，返回移动后的位置，不可移动，返回-1
     *  思路：判断东西南北四个方向是否有可移动的格子
     *          北
     *      西      东
     *          南
     *   (position+1) % Constant.MAX_ROW != 0  说明是中间列的位置
     */
    private Integer changeToPosition(PintuChangeRequest pintuChangeRequest){
        Pintu.PintuButton changeButton = pintuChangeRequest.getChangeButton();
        Pintu.PintuButton[] randomPintuArr = pintuChangeRequest.getRandomPintuButtons();
        Integer position = changeButton.getPosition();
        //东边
        if((position + 1) < Constant.COUNT_BUTTON ){
            if((position+1) % Constant.MAX_ROW != 0 && StringUtils.isEmpty(randomPintuArr[position+1].getIcon())){
                return position + 1;
            }
        }

        //西边
        if(position - 1 >= 0){
            if(position % Constant.MAX_ROW != 0 && StringUtils.isEmpty(randomPintuArr[position - 1].getIcon())){
                return position - 1;
            }
        }

        //北边
        if(position - Constant.MAX_ROW >= 0){
            if(StringUtils.isEmpty(randomPintuArr[position - Constant.MAX_ROW].getIcon())){
                return position - Constant.MAX_ROW;
            }
        }

        //南边
        if((position + Constant.MAX_ROW) < Constant.COUNT_BUTTON){
            if(StringUtils.isEmpty(randomPintuArr[position + Constant.MAX_ROW].getIcon())){
                return position + Constant.MAX_ROW;
            }
        }

        return -1;
    }

    @Override
    public Boolean validateSuccess(Pintu.PintuButton[] pintuButtons) {
        if(!StringUtils.isEmpty(pintuButtons[pintuButtons.length -  1].getIcon())){
            return false;
        }
        Pintu pintu = new Pintu();
        Integer len = pintu.getSourceList().size();
        for(int i = 0;i < len;i++){
            if(!pintuButtons[i].getIcon().equals(pintu.getSourceList().get(i).getIcon())){
                return false;
            }
        }
        return true;
    }
}
