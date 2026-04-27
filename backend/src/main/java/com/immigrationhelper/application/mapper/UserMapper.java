package com.immigrationhelper.application.mapper;

import com.immigrationhelper.application.dto.user.UserDto;
import com.immigrationhelper.domain.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {
    UserDto toDto(User user);
}
