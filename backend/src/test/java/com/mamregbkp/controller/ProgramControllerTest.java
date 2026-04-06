package com.mamregbkp.controller;

import com.mamregbkp.dto.ProgramDto;
import com.mamregbkp.repository.ProgramDocumentRepository;
import com.mamregbkp.repository.ProgramRepository;
import com.mamregbkp.service.FileStorageService;
import com.mamregbkp.service.ProgramService;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ProgramControllerTest {
    @Test
    void pagedEndpointReturnsPagePayloadAndTotalCountHeader() throws Exception {
        ProgramService programService = mock(ProgramService.class);
        FileStorageService fileStorageService = mock(FileStorageService.class);
        ProgramDocumentRepository programDocumentRepository = mock(ProgramDocumentRepository.class);
        ProgramRepository programRepository = mock(ProgramRepository.class);
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new ProgramController(programService, fileStorageService, programDocumentRepository, programRepository))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();

        ProgramDto first = new ProgramDto();
        first.id = 1L;
        first.title = "Program A";

        ProgramDto second = new ProgramDto();
        second.id = 2L;
        second.title = "Program B";

        when(programService.findPaged(0, 2, null, null, null, null))
                .thenReturn(new PageImpl<>(List.of(first, second), PageRequest.of(0, 2), 5));

        mockMvc.perform(get("/api/programs")
                        .param("page", "0")
                        .param("size", "2"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Total-Count", "5"))
                .andExpect(jsonPath("$.content[0].id").value(1))
                .andExpect(jsonPath("$.content[1].title").value("Program B"))
                .andExpect(jsonPath("$.totalElements").value(5));
    }
}
