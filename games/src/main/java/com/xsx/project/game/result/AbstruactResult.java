package com.xsx.project.game.result;

import com.sun.org.apache.xpath.internal.operations.Bool;

import java.util.List;

/**
 * @description:
 * @author: xieshengxiang
 * @date: 2019/6/25 20:21
 */
public class AbstruactResult {

    private String msg;

    private Boolean success;

    private Long code;


    public AbstruactResult(){}

    public AbstruactResult(Boolean success){
        this.success = success;
    }

    public Long getCode() {
        return code;
    }

    public void setCode(Long code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Boolean getSuccess() {
        return success;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }
}
