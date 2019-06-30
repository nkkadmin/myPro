package com.xsx.project.game.po;

import com.xsx.project.game.contants.Constant;

import java.util.ArrayList;
import java.util.List;

/**
 * @description:
 * @author: xieshengxiang
 * @date: 2019/6/25 20:24
 */
public class Pintu {

    //走了几步
    private Integer count = 0;

    private PintuButton[] pintuButtons = new PintuButton[Constant.IMG_ARR.length];

    /**
     * 排序好的数据
     */
    private List<PintuButton> sourceList = new ArrayList<PintuButton>();

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public PintuButton[] getPintuButtons() {
        return pintuButtons;
    }

    public void setPintuButtons(PintuButton[] pintuButtons) {
        this.pintuButtons = pintuButtons;
    }

    public List<PintuButton> getSourceList() {
        PintuButton pintuButton = null;
        for(int i = 0;i< Constant.IMG_ARR.length;i++){
            pintuButton = new PintuButton(i,Constant.IMG_ARR[i]);
            sourceList.add(pintuButton);
        }
        return sourceList;
    }

    public void setSourceList(List<PintuButton> sourceList) {
        this.sourceList = sourceList;
    }


    public static class PintuButton{
        /**
         * 位置
         */
        private Integer position;
        /**
         * 图标
         */
        private String icon;

        public PintuButton() {
        }

        public PintuButton(Integer position, String icon) {
            this.position = position;
            this.icon = icon;
        }

        public Integer getPosition() {
            return position;
        }

        public void setPosition(Integer position) {
            this.position = position;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }

        @Override
        public String toString() {
            return "PintuButton{" +
                    "position=" + position +
                    ", icon='" + icon + '\'' +
                    '}';
        }
    }

    @Override
    public String toString() {
        return "Pintu{" +
                "count=" + count +
                ", pintuButtons=" + pintuButtons +
                '}';
    }

    public static void main(String[] args) {
        Pintu pintu = new Pintu();

        /*for(PintuButton pintuButton : pintu.pintuButtons){
            System.out.println(pintuButton);
        }*/
//        System.out.println(new Random().nextInt(5));
    }
}
