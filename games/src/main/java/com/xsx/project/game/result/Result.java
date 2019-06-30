package com.xsx.project.game.result;

import com.sun.org.apache.xpath.internal.operations.Bool;

import java.util.List;

/**
 * @description:
 * @author: xieshengxiang
 * @date: 2019/6/25 20:22
 */
public class Result extends AbstruactResult {

    private Object content;

    private List list;

    public Result() {
    }

    public Result(Boolean success){
        super(success);
    }

    public Object getContent() {
        return content;
    }

    public void setContent(Object content) {
        this.content = content;
    }

    public List getList() {
        return list;
    }

    public void setList(List list) {
        this.list = list;
    }
}
